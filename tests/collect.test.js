const request = require('supertest');
const app = require('../src/index');

describe('health and auth register', () => {
  it('GET /healthz', async () => {
    const res = await request(app).get('/healthz');
    expect(res.statusCode).toBe(200);
    expect(res.body.ok).toBe(true);
  });
});
