const sanitizeHtml = require('sanitize-html');

const MARKDOWN_RULES = {
  allowedTags: [], // no raw HTML — descriptions/comments are markdown text
  allowedAttributes: {},
  disallowedTagsMode: 'escape', // escape any <tag> as text, never drop content
};

/**
 * Strip HTML and stored-XSS vectors from user text while preserving
 * the literal markdown source (bold, links, code fences etc. survive).
 */
function sanitizeMarkdown(value) {
  const cleaned = sanitizeHtml(String(value ?? '').trim(), MARKDOWN_RULES);
  return cleaned.slice(0, 10000); // hard cap
}

function sanitizeTitle(value) {
  const cleaned = sanitizeHtml(String(value ?? '').trim(), MARKDOWN_RULES);
  return cleaned.slice(0, 120);
}

module.exports = { sanitizeMarkdown, sanitizeTitle };