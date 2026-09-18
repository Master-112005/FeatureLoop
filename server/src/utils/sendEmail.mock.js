const env = require('../config/env');

const sentEmails = [];

function sendEmailMock({ to, subject, text }) {
  const record = { to, subject, text, sentAt: new Date().toISOString() };
  sentEmails.push(record);
  console.log('\n==================================================');
  console.log(`[MOCK EMAIL] to:    ${to}`);
  console.log(`[MOCK EMAIL] subject: ${subject}`);
  console.log('[MOCK EMAIL] ----');
  console.log(text);
  console.log('==================================================\n');
  return record;
}

function buildVerifyLink(token) {
  return `${env.clientOrigin}/verify-email?token=${token}`;
}

function buildResetLink(token) {
  return `${env.clientOrigin}/reset-password?token=${token}`;
}

module.exports = { sendEmailMock, sentEmails, buildVerifyLink, buildResetLink };