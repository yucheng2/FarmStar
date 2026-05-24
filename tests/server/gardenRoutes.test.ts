import Database from 'better-sqlite3'
import { afterEach, describe, expect, it } from 'vitest'
import { closeDatabase, getDatabase } from '../../server/database/connection'
import { seedDatabase } from '../../server/database/seed'
import { createApp } from '../../server/app'
import { createGardenRepository } from '../../server/repositories/gardenRepository'
import { createUserRepository } from '../../server/repositories/userRepository'

describe('garden routes', () => {
  afterEach(() => {
    closeDatabase()
  })

  function createTestApp() {
    const db = getDatabase(':memory:')
    seedDatabase(db)
    const gardenRepo = createGardenRepository({ db })
    const userRepo = createUserRepository(db)
    return { app: createApp(gardenRepo, userRepo), userRepo }
  }

  function getAuthHeader(userRepo: ReturnType<typeof createUserRepository>) {
    const result = userRepo.createUser('testuser', 'password123')
    return { authorization: `Bearer ${result.token}` }
  }

  it('filters fields by status and keyword', async () => {
    const { app } = createTestApp()
    const response = await app.inject({ method: 'GET', url: '/api/fields?status=idle&keyword=%E7%94%B0%E5%9C%B0001' })

    expect(response.statusCode).toBe(200)
    expect(response.json().items).toMatchObject([{ code: '田地001', status: 'idle' }])
  })

  it('returns unsplash field cover image urls', async () => {
    const { app } = createTestApp()
    const response = await app.inject({ method: 'GET', url: '/api/fields/field-001' })

    expect(response.statusCode).toBe(200)
    expect(response.json().imageUrl).toContain('https://images.unsplash.com/')
  })

  it('returns recommended caretakers sorted by distance', async () => {
    const { app } = createTestApp()
    const response = await app.inject({ method: 'GET', url: '/api/fields/field-001/recommended-caretakers' })

    expect(response.statusCode).toBe(200)
    expect(response.json().items.map((caretaker: { id: string }) => caretaker.id)).toEqual([
      'caretaker-zhang',
      'caretaker-zhou',
      'caretaker-sun',
      'caretaker-li',
      'caretaker-wang',
      'caretaker-chen',
      'caretaker-zhao',
      'caretaker-wu'
    ])
  })

  it('filters caretakers by rating, experience, and specialty', async () => {
    const { app } = createTestApp()
    const response = await app.inject({ method: 'GET', url: '/api/caretakers?ratingMin=4.5&experienceRange=5_plus&specialty=vegetable' })

    expect(response.statusCode).toBe(200)
    expect(response.json().items.map((caretaker: { id: string }) => caretaker.id)).toEqual([
      'caretaker-zhang',
      'caretaker-li',
      'caretaker-chen',
      'caretaker-zhou'
    ])
  })

  it('creates adoption and returns it by id', async () => {
    const { app, userRepo } = createTestApp()
    const headers = getAuthHeader(userRepo)
    const createResponse = await app.inject({
      method: 'POST',
      url: '/api/adoptions',
      headers,
      payload: { fieldId: 'field-001', caretakerId: 'caretaker-zhang' }
    })

    expect(createResponse.statusCode).toBe(200)
    expect(createResponse.json()).toMatchObject({
      adoptionId: 'adoption-field-001-caretaker-zhang',
      status: 'pending_payment',
      paymentOrderId: 'payment-field-001-caretaker-zhang'
    })

    const getResponse = await app.inject({ method: 'GET', url: '/api/adoptions/adoption-field-001-caretaker-zhang', headers })

    expect(getResponse.statusCode).toBe(200)
    expect(getResponse.json()).toMatchObject({ fieldId: 'field-001', caretakerId: 'caretaker-zhang' })
  })

  it('returns persisted adoption after creating a new app with the same database', async () => {
    const db = getDatabase(':memory:')
    seedDatabase(db)
    const gardenRepo = createGardenRepository({ db })
    const userRepo = createUserRepository(db)
    const headers = getAuthHeader(userRepo)
    const firstApp = createApp(gardenRepo, userRepo)

    const createResponse = await firstApp.inject({
      method: 'POST',
      url: '/api/adoptions',
      headers,
      payload: { fieldId: 'field-001', caretakerId: 'caretaker-zhang' }
    })

    expect(createResponse.statusCode).toBe(200)

    const secondApp = createApp(gardenRepo, userRepo)
    const getResponse = await secondApp.inject({ method: 'GET', url: '/api/adoptions/adoption-field-001-caretaker-zhang', headers })
    const fieldResponse = await secondApp.inject({ method: 'GET', url: '/api/fields/field-001' })

    expect(getResponse.statusCode).toBe(200)
    expect(getResponse.json()).toMatchObject({
      id: 'adoption-field-001-caretaker-zhang',
      fieldId: 'field-001',
      caretakerId: 'caretaker-zhang',
      paymentOrderId: 'payment-field-001-caretaker-zhang'
    })
    expect(fieldResponse.json()).toMatchObject({
      id: 'field-001',
      status: 'adopted',
      adoptionId: 'adoption-field-001-caretaker-zhang'
    })
  })

  it('returns seed adopted field and adoption record', async () => {
    const { app, userRepo } = createTestApp()
    const headers = getAuthHeader(userRepo)
    const fieldResponse = await app.inject({ method: 'GET', url: '/api/fields/field-002' })
    const adoptionResponse = await app.inject({ method: 'GET', url: '/api/adoptions/adoption-field-002-caretaker-li', headers })

    expect(fieldResponse.statusCode).toBe(200)
    expect(fieldResponse.json()).toMatchObject({
      id: 'field-002',
      status: 'adopted',
      adoptionId: 'adoption-field-002-caretaker-li'
    })
    expect(adoptionResponse.statusCode).toBe(200)
    expect(adoptionResponse.json()).toMatchObject({
      id: 'adoption-field-002-caretaker-li',
      fieldId: 'field-002',
      caretakerId: 'caretaker-li'
    })
  })

  it('returns user adoptions with field and caretaker', async () => {
    const { app, userRepo } = createTestApp()
    const headers = getAuthHeader(userRepo)
    const response = await app.inject({ method: 'GET', url: '/api/adoptions', headers })

    expect(response.statusCode).toBe(200)
    expect(response.json().items).toMatchObject([])
  })

  it('includes newly created adoption in user adoptions', async () => {
    const { app, userRepo } = createTestApp()
    const headers = getAuthHeader(userRepo)
    await app.inject({
      method: 'POST',
      url: '/api/adoptions',
      headers,
      payload: { fieldId: 'field-001', caretakerId: 'caretaker-zhang' }
    })
    const response = await app.inject({ method: 'GET', url: '/api/adoptions', headers })

    expect(response.statusCode).toBe(200)
    expect(response.json().items.map((item: { id: string }) => item.id)).toContain('adoption-field-001-caretaker-zhang')
  })

  it('rejects unauthenticated adoption requests', async () => {
    const { app } = createTestApp()
    const response = await app.inject({
      method: 'POST',
      url: '/api/adoptions',
      payload: { fieldId: 'field-001', caretakerId: 'caretaker-zhang' }
    })

    expect(response.statusCode).toBe(401)
  })

  it('rejects adoption when field is not idle', async () => {
    const { app, userRepo } = createTestApp()
    const headers = getAuthHeader(userRepo)
    const response = await app.inject({
      method: 'POST',
      url: '/api/adoptions',
      headers,
      payload: { fieldId: 'field-002', caretakerId: 'caretaker-zhang' }
    })

    expect(response.statusCode).toBe(400)
    expect(response.json()).toMatchObject({ message: '该田地已不可认养' })
  })

  it('marks field as adopted after creating adoption', async () => {
    const { app, userRepo } = createTestApp()
    const headers = getAuthHeader(userRepo)
    const createResponse = await app.inject({
      method: 'POST',
      url: '/api/adoptions',
      headers,
      payload: { fieldId: 'field-001', caretakerId: 'caretaker-zhang' }
    })
    const fieldResponse = await app.inject({ method: 'GET', url: '/api/fields/field-001' })

    expect(createResponse.statusCode).toBe(200)
    expect(fieldResponse.statusCode).toBe(200)
    expect(fieldResponse.json()).toMatchObject({
      id: 'field-001',
      status: 'adopted',
      adoptionId: 'adoption-field-001-caretaker-zhang',
      caretaker: { id: 'caretaker-zhang', name: '张叔' }
    })
  })

  it('rejects duplicate adoption for the same field', async () => {
    const { app, userRepo } = createTestApp()
    const headers = getAuthHeader(userRepo)
    const firstResponse = await app.inject({
      method: 'POST',
      url: '/api/adoptions',
      headers,
      payload: { fieldId: 'field-001', caretakerId: 'caretaker-zhang' }
    })
    const secondResponse = await app.inject({
      method: 'POST',
      url: '/api/adoptions',
      headers,
      payload: { fieldId: 'field-001', caretakerId: 'caretaker-li' }
    })

    expect(firstResponse.statusCode).toBe(200)
    expect(secondResponse.statusCode).toBe(400)
    expect(secondResponse.json()).toMatchObject({ message: '该田地已不可认养' })
  })

  it('returns not found errors', async () => {
    const { app } = createTestApp()
    const response = await app.inject({ method: 'GET', url: '/api/fields/missing-field' })

    expect(response.statusCode).toBe(404)
    expect(response.json()).toMatchObject({ message: '田地不存在' })
  })

  it('confirms payment and updates adoption status to active', async () => {
    const { app, userRepo } = createTestApp()
    const headers = getAuthHeader(userRepo)

    await app.inject({
      method: 'POST',
      url: '/api/adoptions',
      headers,
      payload: { fieldId: 'field-001', caretakerId: 'caretaker-zhang' }
    })

    const payResponse = await app.inject({
      method: 'POST',
      url: '/api/adoptions/adoption-field-001-caretaker-zhang/pay',
      headers
    })

    expect(payResponse.statusCode).toBe(200)
    expect(payResponse.json()).toMatchObject({
      adoptionId: 'adoption-field-001-caretaker-zhang',
      status: 'active',
      amount: 120
    })

    const adoptionResponse = await app.inject({
      method: 'GET',
      url: '/api/adoptions/adoption-field-001-caretaker-zhang',
      headers
    })

    expect(adoptionResponse.json().status).toBe('active')
  })

  it('rejects payment for non-existent adoption', async () => {
    const { app, userRepo } = createTestApp()
    const headers = getAuthHeader(userRepo)

    const response = await app.inject({
      method: 'POST',
      url: '/api/adoptions/non-existent/pay',
      headers
    })

    expect(response.statusCode).toBe(404)
    expect(response.json()).toMatchObject({ message: '认养记录不存在' })
  })

  it('rejects payment for already paid adoption', async () => {
    const { app, userRepo } = createTestApp()
    const headers = getAuthHeader(userRepo)

    await app.inject({
      method: 'POST',
      url: '/api/adoptions',
      headers,
      payload: { fieldId: 'field-001', caretakerId: 'caretaker-zhang' }
    })

    await app.inject({
      method: 'POST',
      url: '/api/adoptions/adoption-field-001-caretaker-zhang/pay',
      headers
    })

    const secondPayResponse = await app.inject({
      method: 'POST',
      url: '/api/adoptions/adoption-field-001-caretaker-zhang/pay',
      headers
    })

    expect(secondPayResponse.statusCode).toBe(400)
    expect(secondPayResponse.json()).toMatchObject({ message: '该认养已支付' })
  })

  it('seeds monitoring data when an existing database is missing newer fields and caretakers', () => {
    const db = getDatabase(':memory:')
    seedDatabase(db)

    db.prepare("DELETE FROM adoptions WHERE field_id NOT IN ('field-001', 'field-002', 'field-003', 'field-004')").run()
    db.prepare("DELETE FROM field_monitoring_media WHERE field_id NOT IN ('field-001', 'field-002', 'field-003', 'field-004')").run()
    db.prepare("DELETE FROM field_care_logs WHERE field_id NOT IN ('field-001', 'field-002', 'field-003', 'field-004')").run()
    db.prepare("DELETE FROM fields WHERE id NOT IN ('field-001', 'field-002', 'field-003', 'field-004')").run()
    db.prepare("DELETE FROM caretakers WHERE id NOT IN ('caretaker-zhang', 'caretaker-li', 'caretaker-wang', 'caretaker-zhao', 'caretaker-sun')").run()

    expect(() => seedDatabase(db)).not.toThrow()
    expect(db.prepare("SELECT COUNT(*) as count FROM caretakers WHERE id IN ('caretaker-chen', 'caretaker-wu', 'caretaker-zhou')").get()).toMatchObject({ count: 3 })
    expect(db.prepare("SELECT COUNT(*) as count FROM fields WHERE id IN ('field-005', 'field-006', 'field-007', 'field-008')").get()).toMatchObject({ count: 4 })
  })

  it('returns monitoring detail for adopted field', async () => {
    const { app } = createTestApp()
    const response = await app.inject({ method: 'GET', url: '/api/fields/field-002/monitoring' })

    expect(response.statusCode).toBe(200)
    const body = response.json()
    expect(body).toMatchObject({
      field: { id: 'field-002', name: '我的小菜园' },
      caretaker: { id: 'caretaker-li', name: '李伯' },
      monitoringStatus: 'live',
      cameraStatus: 'online',
      liveStreamUrl: 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4',
      latestSnapshotUrl: expect.stringContaining('https://images.unsplash.com/'),
      careLogs: [
        expect.objectContaining({ action: '浇水', caretakerName: '李伯' }),
        expect.objectContaining({ action: '除草', caretakerName: '李伯' })
      ]
    })
    expect(response.json().media[0]).toMatchObject({ type: 'image', caption: '清晨巡田照片，西红柿长势稳定' })
  })

  it('returns unavailable monitoring detail for field without updates', async () => {
    const { app } = createTestApp()
    const response = await app.inject({ method: 'GET', url: '/api/fields/field-001/monitoring' })

    expect(response.statusCode).toBe(200)
    expect(response.json()).toMatchObject({
      field: { id: 'field-001', status: 'idle' },
      monitoringStatus: 'unavailable',
      cameraStatus: 'not_installed',
      media: [],
      careLogs: []
    })
  })

  it('returns not found for missing field monitoring detail', async () => {
    const { app } = createTestApp()
    const response = await app.inject({ method: 'GET', url: '/api/fields/missing-field/monitoring' })

    expect(response.statusCode).toBe(404)
    expect(response.json()).toMatchObject({ message: '田地不存在' })
  })
})
