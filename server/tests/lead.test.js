const request = require('supertest');
const app = require('../src/app');
const { createUser } = require('./helpers');

describe('Public Lead Capture', () => {
  it('accepts a valid public lead submission', async () => {
    const res = await request(app).post('/api/public/leads').send({
      name: 'Public Prospect',
      email: 'prospect@example.com',
      phone: '+1 555 123 4567',
      company: 'Acme Inc',
      message: 'Interested in your product',
    });

    expect(res.status).toBe(201);
    expect(res.body.data.lead.status).toBe('New');
    expect(res.body.data.lead.activity).toHaveLength(1);
    expect(res.body.data.lead.activity[0].type).toBe('LEAD_CREATED');
  });

  it('rejects an invalid email on the public form', async () => {
    const res = await request(app).post('/api/public/leads').send({
      name: 'Bad Email',
      email: 'not-an-email',
      phone: '+1 555 123 4567',
    });

    expect(res.status).toBe(400);
  });

  it('prevents duplicate submissions with the same email and phone', async () => {
    const payload = {
      name: 'Repeat Prospect',
      email: 'repeat@example.com',
      phone: '+1 555 999 0000',
    };

    const first = await request(app).post('/api/public/leads').send(payload);
    expect(first.status).toBe(201);

    const second = await request(app).post('/api/public/leads').send(payload);
    expect(second.status).toBe(409);
  });
});

describe('Lead Creation (authenticated)', () => {
  it('allows an admin to create a lead', async () => {
    const { token } = await createUser({ role: 'admin' });

    const res = await request(app)
      .post('/api/leads')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Direct Lead', email: 'direct@example.com', phone: '+1 555 111 2222' });

    expect(res.status).toBe(201);
    expect(res.body.data.lead.name).toBe('Direct Lead');
  });

  it('validates required fields', async () => {
    const { token } = await createUser({ role: 'admin' });

    const res = await request(app)
      .post('/api/leads')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'A' }); // too short, missing email/phone

    expect(res.status).toBe(400);
    expect(res.body.details).toBeDefined();
  });
});

describe('Lead Assignment', () => {
  it('allows an admin to assign a lead to a member', async () => {
    const { token: adminToken } = await createUser({ role: 'admin' });
    const { user: member } = await createUser({ role: 'member' });

    const createRes = await request(app)
      .post('/api/leads')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ name: 'Assign Me', email: 'assign@example.com', phone: '+1 555 222 3333' });

    const leadId = createRes.body.data.lead._id;

    const assignRes = await request(app)
      .patch(`/api/leads/${leadId}/assign`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ userId: member._id.toString() });

    expect(assignRes.status).toBe(200);
    expect(assignRes.body.data.lead.assignedTo._id).toBe(member._id.toString());

    const activityTypes = assignRes.body.data.lead.activity.map((a) => a.type);
    expect(activityTypes).toContain('ASSIGNED');
  });

  it('lets an assigned member view and update their lead status', async () => {
    const { token: adminToken } = await createUser({ role: 'admin' });
    const { user: member, token: memberToken } = await createUser({ role: 'member' });

    const createRes = await request(app)
      .post('/api/leads')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ name: 'Status Lead', email: 'status@example.com', phone: '+1 555 333 4444' });

    const leadId = createRes.body.data.lead._id;

    await request(app)
      .patch(`/api/leads/${leadId}/assign`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ userId: member._id.toString() });

    const statusRes = await request(app)
      .patch(`/api/leads/${leadId}/status`)
      .set('Authorization', `Bearer ${memberToken}`)
      .send({ status: 'Contacted' });

    expect(statusRes.status).toBe(200);
    expect(statusRes.body.data.lead.status).toBe('Contacted');
  });

  it('prevents a member from viewing a lead not assigned to them', async () => {
    const { token: adminToken } = await createUser({ role: 'admin' });
    const { token: memberToken } = await createUser({ role: 'member' });

    const createRes = await request(app)
      .post('/api/leads')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ name: 'Not Yours', email: 'notyours@example.com', phone: '+1 555 444 5555' });

    const leadId = createRes.body.data.lead._id;

    const res = await request(app)
      .get(`/api/leads/${leadId}`)
      .set('Authorization', `Bearer ${memberToken}`);

    expect(res.status).toBe(403);
  });

  it('supports pagination, filtering, and search', async () => {
    const { token } = await createUser({ role: 'admin' });

    await Promise.all(
      Array.from({ length: 15 }).map((_, i) =>
        request(app)
          .post('/api/leads')
          .set('Authorization', `Bearer ${token}`)
          .send({
            name: `Bulk Lead ${i}`,
            email: `bulk${i}@example.com`,
            phone: `+1 555 000 ${1000 + i}`,
            status: 'New',
          })
      )
    );

    const res = await request(app)
      .get('/api/leads?page=2&limit=5')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(5);
    expect(res.body.meta.page).toBe(2);
    expect(res.body.meta.total).toBeGreaterThanOrEqual(15);

    const searchRes = await request(app)
      .get('/api/leads?search=Bulk Lead 3')
      .set('Authorization', `Bearer ${token}`);

    expect(searchRes.status).toBe(200);
    expect(searchRes.body.data.length).toBeGreaterThan(0);
  });
});
