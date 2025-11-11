const crypto = require('crypto');

function genApiKey() {
  return crypto.randomBytes(32).toString('hex');
}

function hashApiKey(apiKey) {
  return crypto.createHash('sha256').update(apiKey).digest('hex');
}

module.exports = { genApiKey, hashApiKey };
