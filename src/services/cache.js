const IORedis = require('ioredis');
const redis = new IORedis(process.env.REDIS_URL);

module.exports = {
  get: async (key) => {
    const v = await redis.get(key);
    return v;
  },
  set: async (key, value, ttlSec = 300) => {
    await redis.set(key, value, 'EX', ttlSec);
  },
  del: async (key) => redis.del(key),
  client: redis
};
