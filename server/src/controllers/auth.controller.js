const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const env = require('../config/env');
const {
  generateAccessToken,
  generateRefreshToken,
  hashToken,
  refreshCookieOptions,
  clearRefreshCookieOptions,
} = require('../utils/generateTokens');
const {
  buildResetLink,
} = require('../utils/sendEmail.mock');

exports.signup = async (req, res, next) => {
  try {
    const { username, email, password, adminPassword } = req.body;

    if (
      !env.adminSignupPassword ||
      adminPassword.length !== env.adminSignupPassword.length ||
      !crypto.timingSafeEqual(Buffer.from(adminPassword), Buffer.from(env.adminSignupPassword))
    ) {
      return res.status(403).json({
        error: 'Invalid admin authorization password',
        code: 'INVALID_ADMIN_PASSWORD',
      });
    }

    const existing = await User.exists({
      $or: [{ username }, { email: String(email).toLowerCase() }],
    });
    if (existing) {
      return res
        .status(409)
        .json({ error: 'That username or email is already registered', code: 'USER_EXISTS' });
    }

    const user = await User.create({
      username,
      email,
      passwordHash: password,
      isVerified: true,
      verificationToken: null,
    });

    return res.status(201).json({
      message: 'Account created and verified by the administrator.',
      user: user.toPublic(),
    });
  } catch (err) {
    return next(err);
  }
};

exports.verifyEmail = async (req, res, next) => {
  try {
    const user = await User.findOne({ verificationToken: req.params.token });
    if (!user) {
      return res.status(400).json({ error: 'Invalid or expired verification link', code: 'INVALID_TOKEN' });
    }
    if (user.isVerified) {
      user.verificationToken = null;
      await user.save();
      return res.json({ message: 'Email already verified — you can log in.', user: user.toPublic() });
    }
    user.isVerified = true;
    user.verificationToken = null;
    await user.save();
    return res.json({ message: 'Email verified — you can now log in.', user: user.toPublic() });
  } catch (err) {
    return next(err);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { emailOrUsername, password } = req.body;
    const user = await User.findOne({
      $or: [
        { email: String(emailOrUsername).toLowerCase() },
        { username: emailOrUsername },
      ],
    });

    if (!user || !(await user.verifyPassword(password))) {
      return res.status(401).json({ error: 'Invalid credentials', code: 'BAD_CREDENTIALS' });
    }

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);
    user.refreshTokenHash = hashToken(refreshToken);
    await user.save();

    res.cookie('refreshToken', refreshToken, refreshCookieOptions());
    return res.json({ message: 'Logged in', user: user.toPublic(), accessToken });
  } catch (err) {
    return next(err);
  }
};

exports.refresh = async (req, res, next) => {
  try {
    const presented = req.cookies && req.cookies.refreshToken;
    if (!presented) {
      return res.status(401).json({ error: 'Refresh token required', code: 'NO_REFRESH_TOKEN' });
    }

    let payload;
    try {
      payload = jwt.verify(presented, env.jwtRefreshSecret);
    } catch (err) {
      return res.status(401).json({ error: 'Invalid or expired refresh token', code: 'INVALID_REFRESH_TOKEN' });
    }

    const user = await User.findById(payload.sub);
    if (!user || user.refreshTokenHash !== hashToken(presented)) {
      // Token was already rotated (>1 replay) or forged → treat as compromise,
      // revoke the whole session so the attacker's cookie dies too.
      if (user) {
        user.refreshTokenHash = null;
        await user.save();
      }
      res.clearCookie('refreshToken', clearRefreshCookieOptions());
      return res
        .status(401)
        .json({ error: 'Refresh token reuse detected — session revoked', code: 'REFRESH_REUSE' });
    }

    const accessToken = generateAccessToken(user);
    const nextRefresh = generateRefreshToken(user);
    user.refreshTokenHash = hashToken(nextRefresh);
    await user.save();

    res.cookie('refreshToken', nextRefresh, refreshCookieOptions());
    return res.json({ message: 'Tokens refreshed', user: user.toPublic(), accessToken });
  } catch (err) {
    return next(err);
  }
};

exports.logout = async (req, res, next) => {
  try {
    const presented = req.cookies && req.cookies.refreshToken;
    if (presented) {
      try {
        const payload = jwt.verify(presented, env.jwtRefreshSecret);
        const user = await User.findById(payload.sub);
        if (user && user.refreshTokenHash === hashToken(presented)) {
          user.refreshTokenHash = null;
          await user.save();
        }
      } catch (err) {
        /* ignore — cookie is garbage anyway */
      }
    }
    res.clearCookie('refreshToken', clearRefreshCookieOptions());
    return res.json({ message: 'Logged out' });
  } catch (err) {
    return next(err);
  }
};

exports.forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email: String(email).toLowerCase() });

    if (user) {
      const token = crypto.randomBytes(32).toString('hex');
      user.resetPasswordToken = token;
      user.resetPasswordExpires = new Date(Date.now() + 60 * 60 * 1000); // 1h
      await user.save();

      await sendEmailMock({
        to: user.email,
        subject: 'Reset your password — FeatureLoop',
        text: [
          `Hi ${user.username},`,
          '',
          'We received a request to reset your password:',
          '',
          buildResetLink(token),
          '',
          'This link expires in 1 hour. If you didn’t request it, you can ignore this email.',
          '',
        ].join('\n'),
      });
    }

    // Always return the same message — don't leak which emails exist.
    return res.json({
      message: 'If an account exists for that email, a reset link is on its way (check the server console).',
    });
  } catch (err) {
    return next(err);
  }
};

exports.resetPassword = async (req, res, next) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: new Date() },
    });
    if (!user) {
      return res.status(400).json({ error: 'Invalid or expired reset token', code: 'INVALID_RESET_TOKEN' });
    }

    user.passwordHash = password;
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;
    user.refreshTokenHash = null; // invalidate all existing sessions
    await user.save();

    res.clearCookie('refreshToken', clearRefreshCookieOptions());
    return res.json({ message: 'Password updated — you can now log in.' });
  } catch (err) {
    return next(err);
  }
};

exports.me = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found', code: 'NOT_FOUND' });
    }
    return res.json({ user: user.toPublic() });
  } catch (err) {
    return next(err);
  }
};