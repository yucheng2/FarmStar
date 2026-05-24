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

  it('returns recommended caretakers sorted by distance', async () => {
    const { app } = createTestApp()
    const response = await app.inject({ method: 'GET', url: '/api/fields/field-001/recommended-caretakers' })

    expect(response.statusCode).toBe(200)
    expect(response.json().items.map((caretaker: { id: string }) => caretaker.id)).toEqual([
      'caretaker-zhang',
      'caretaker-sun',
      'caretaker-li',
      'caretaker-wang',
      'caretaker-zhao'
    ])
  })

  it('filters caretakers by rating, experience, and specialty', async () => {
    const { app } = createTestApp()
    const response = await app.inject({ method: 'GET', url: '/api/caretakers?ratingMin=4.5&experienceRange=5_plus&specialty=vegetable' })

    expect(response.statusCode).toBe(200)
    expect(response.json().items.map((caretaker: { id: string }) => caretaker.id)).toEqual(['caretaker-zhang', 'caretaker-li'])
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
})
