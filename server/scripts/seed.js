require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const mongoose = require('mongoose');
const User = require('../src/models/User');
const FeatureRequest = require('../src/models/FeatureRequest');
const Comment = require('../src/models/Comment');
const env = require('../src/config/env');

const CATEGORIES = ['UI/UX', 'Integrations', 'Performance', 'General'];

const requests = [
  {
    title: 'Dark mode with automatic system preference',
    description:
      'Add a **dark theme** that follows `prefers-color-scheme`, plus a manual override toggle.\n\nThe palette already exists in our design tokens, so this is mostly wiring + testing across cards, comments and the roadmap.',
    category: 'UI/UX',
    status: 'Planned',
  },
  {
    title: 'Slack integration for status changes',
    description:
      'When an item moves to *In Progress* or *Completed*, post a message to a configured Slack channel.\n\nKeep the integration **lightweight**: webhook-only, no OAuth scopes beyond incoming-webhooks.',
    category: 'Integrations',
    status: 'In Progress',
  },
  {
    title: 'Keyboard shortcuts for the feed',
    description:
      'Today from the feed, or use the search with the "/" shortcut. Specifically:\n\n- `1`/`2`/`3` switch sort tabs\n- `j`/`k` move between cards\n- `u` upvote the focused card',
    category: 'UI/UX',
    status: 'Under Review',
  },
  {
    title: 'Faster initial feed load',
    description:
      'Profile shows ~1.2s to first paint on cold cache. Ideas:\n\n- Split request list query from author population\n- Add a lightweight projection endpoint for the feed\n- Cache roadmap JSON for 60s',
    category: 'Performance',
    status: 'Completed',
  },
  {
    title: 'Batch export requests to CSV',
    description:
      'Admins should be able to download all requests (+ votes + comments) as CSV from the admin dashboard.\n' + 'Set an upper bound (10k rows) and stream the response.',
    category: 'General',
    status: 'Under Review',
  },
  {
    title: 'Comment mentions with @username',
    description:
      'Type `@` in a comment to mention another participant. Mentions render as links and add a subtle notification dot on the navbar.',
    category: 'UI/UX',
    status: 'Planned',
  },
  {
    title: 'Webhooks for private roadmaps',
    description:
      'Allow sеlf-hosters to ship roadmap changes to their own systems without polling. JSON payload, signed with HMAC.',
    category: 'Integrations',
    status: 'Under Review',
  },
];

async function run() {
  await mongoose.connect(env.mongoUri);
  console.log(`[seed] connected (${env.mongoUri}) — clearing existing data`);

  await Promise.all([
    User.deleteMany({}),
    FeatureRequest.deleteMany({}),
    Comment.deleteMany({}),
  ]);

  const admin = await User.create({
    username: 'admin',
    email: 'admin@featureloop.dev',
    passwordHash: 'password123',
    role: 'admin',
    isVerified: true,
    avatarUrl: null,
  });

  const demos = await User.create([
    {
      username: 'maya',
      email: 'maya@featureloop.dev',
      passwordHash: 'password123',
      isVerified: true,
    },
    {
      username: 'leon',
      email: 'leon@featureloop.dev',
      passwordHash: 'password123',
      isVerified: true,
    },
    {
      username: 'priya',
      email: 'priya@featureloop.dev',
      passwordHash: 'password123',
      isVerified: true,
    },
  ]);

  const populated = [];
  const votes = [
    [0, demos[0]],
    [0, demos[1]],
    [1, demos[0]],
    [1, demos[2]],
    [3, demos[1]],
    [4, demos[0]],
    [5, demos[2]],
  ];

  for (let i = 0; i < requests.length; i += 1) {
    const spec = requests[i];
    const author = [admin, demos[0], demos[2], demos[1]][i % 4];
    const upvotedBy = votes.filter(([idx]) => idx === i).map(([, u]) => u._id);
    const item = await FeatureRequest.create({
      title: spec.title,
      description: spec.description,
      category: spec.category,
      status: spec.status,
      author: author._id,
      upvotedBy,
      upvoteCount: upvotedBy.length,
    });
    populated.push(item);
  }

  const c1 = await Comment.create({
    content: 'I’d use this every day. Especially the `prefers-color-scheme` part.',
    author: demos[0]._id,
    featureRequest: populated[0]._id,
  });
  await Comment.create({
    content: 'Agreed — could we also ship a light-mode-only override for the office kiosk?',
    author: demos[1]._id,
    featureRequest: populated[0]._id,
    parentComment: c1._id,
  });
  await Comment.create({
    content: 'We can start with incoming-webhooks only and iterate.',
    author: admin._id,
    featureRequest: populated[1]._id,
  });
  await Comment.create({
    content: 'Great win — pagination of the CSV stays client-side then.',
    author: demos[2]._id,
    featureRequest: populated[3]._id,
  });

  for (let i = 0; i < populated.length; i += 1) {
    const count = await Comment.countDocuments({ featureRequest: populated[i]._id, isDeleted: false });
    await FeatureRequest.updateOne({ _id: populated[i]._id }, { $set: { commentCount: count } });
  }

  console.log('[seed] done');
  console.log('  admin : admin@featureloop.dev / password123  (role: admin)');
  console.log('  user  : maya@featureloop.dev  / password123  (role: user)');
  console.log(`  7 feature requests seeded across ${CATEGORIES.join(', ')}`);

  await mongoose.connection.close();
}

run().catch((err) => {
  console.error('[seed] failed:', err);
  process.exit(1);
});