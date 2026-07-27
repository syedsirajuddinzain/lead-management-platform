const request = require('supertest');
const app = require('../src/app');
const { createUser } = require('./helpers');

describe('Authentication', () => {
  it('registers a new user and returns a token', async () => {
    const res = await request(app).post('/api/auth/register').send({
      name: 'Jane Doe',
      email: 'jane@example.com',
      password: 'Passw0rd!',
    });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.token).toBeDefined();
    expect(res.body.data.user.email).toBe('jane@example.com');
    expect(res.body.data.user.password).toBeUndefined();
    expect(res.body.data.user.role).toBe('member'); // public registration cannot self-assign admin
  });

  it('rejects registration with a weak password', async () => {
    const res = await request(app).post('/api/auth/register').send({
      name: 'Jane Doe',
      email: 'jane2@example.com',
      password: 'weak',
    });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('rejects duplicate email registration', async () => {
    await createUser({ email: 'dupe@example.com' });

    const res = await request(app).post('/api/auth/register').send({
      name: 'Dupe',
      email: 'dupe@example.com',
      password: 'Passw0rd!',
    });

    expect(res.status).toBe(409);
  });

  it('logs in with correct credentials', async () => {
    await createUser({ email: 'login@example.com', password: 'Passw0rd!' });

    const res = await request(app).post('/api/auth/login').send({
      email: 'login@example.com',
      password: 'Passw0rd!',
    });

    expect(res.status).toBe(200);
    expect(res.body.data.token).toBeDefined();
  });

  it('rejects login with wrong password', async () => {
    await createUser({ email: 'login2@example.com', password: 'Passw0rd!' });

    const res = await request(app).post('/api/auth/login').send({
      email: 'login2@example.com',
      password: 'WrongPassword1',
    });

    expect(res.status).toBe(401);
  });

  it('rejects requests to protected routes without a token', async () => {
    const res = await request(app).get('/api/auth/me');
    expect(res.status).toBe(401);
  });

  it('returns the current user profile with a valid token', async () => {
    const { token, user } = await createUser({ email: 'me@example.com' });

    const res = await request(app).get('/api/auth/me').set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.data.user.email).toBe(user.email);
  });

  it('rejects requests with a malformed token', async () => {
    const res = await request(app).get('/api/auth/me').set('Authorization', 'Bearer not-a-real-token');
    expect(res.status).toBe(401);
  });
});

describe('Authorization', () => {
  it('allows an admin to access the user management endpoint', async () => {
    const { token } = await createUser({ role: 'admin' });

    const res = await request(app).get('/api/users').set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
  });

  it('forbids a member from accessing the user management endpoint', async () => {
    const { token } = await createUser({ role: 'member' });

    const res = await request(app).get('/api/users').set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(403);
  });

  it('forbids a member from creating a lead directly', async () => {
    const { token } = await createUser({ role: 'member' });

    const res = await request(app)
      .post('/api/leads')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Prospect', email: 'p@example.com', phone: '+1 555 000 1111' });

    expect(res.status).toBe(403);
  });

  it('forbids a member from deleting a lead', async () => {
    const { token: adminToken } = await createUser({ role: 'admin' });
    const { token: memberToken } = await createUser({ role: 'member' });

    const createRes = await request(app)
      .post('/api/leads')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ name: 'Prospect', email: 'del@example.com', phone: '+1 555 000 2222' });

    const leadId = createRes.body.data.lead._id;

    const res = await request(app)
      .delete(`/api/leads/${leadId}`)
      .set('Authorization', `Bearer ${memberToken}`);

    expect(res.status).toBe(403);
  });
});
