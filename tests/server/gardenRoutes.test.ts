import { mkdtemp, rm, access } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterEach, describe, expect, it } from 'vitest'
import { createApp } from '../../server/app'
import { createGardenRepository } from '../../server/repositories/gardenRepository'

const temporaryDirectories: string[] = []

async function createAdoptionStoragePath() {
  const directory = await mkdtemp(join(tmpdir(), 'farmstar-adoptions-'))
  temporaryDirectories.push(directory)
  return join(directory, 'adoptions.json')
}

describe('garden routes', () => {
  afterEach(async () => {
    await Promise.all(temporaryDirectories.splice(0).map((directory) => rm(directory, { recursive: true, force: true })))
  })
  it('filters fields by status and keyword', async () => {
    const app = createApp()
    const response = await app.inject({ method: 'GET', url: '/api/fields?status=idle&keyword=%E7%94%B0%E5%9C%B0001' })

    expect(response.statusCode).toBe(200)
    expect(response.json().items).toMatchObject([{ code: '田地001', status: 'idle' }])
  })

  it('returns recommended caretakers within three kilometers sorted by ranking rules', async () => {
    const app = createApp()
    const response = await app.inject({ method: 'GET', url: '/api/fields/field-001/recommended-caretakers' })

    expect(response.statusCode).toBe(200)
    expect(response.json().items.map((caretaker: { id: string }) => caretaker.id)).toEqual([
      'caretaker-zhang',
      'caretaker-li',
      'caretaker-wang'
    ])
  })

  it('filters caretakers by rating, experience, and specialty', async () => {
    const app = createApp()
    const response = await app.inject({ method: 'GET', url: '/api/caretakers?ratingMin=4.5&experienceRange=5_plus&specialty=vegetable' })

    expect(response.statusCode).toBe(200)
    expect(response.json().items.map((caretaker: { id: string }) => caretaker.id)).toEqual(['caretaker-zhang', 'caretaker-li'])
  })

  it('creates adoption and returns it by id', async () => {
    const app = createApp()
    const createResponse = await app.inject({
      method: 'POST',
      url: '/api/adoptions',
      payload: { fieldId: 'field-001', caretakerId: 'caretaker-zhang' }
    })

    expect(createResponse.statusCode).toBe(200)
    expect(createResponse.json()).toMatchObject({
      adoptionId: 'adoption-field-001-caretaker-zhang',
      status: 'pending_payment',
      paymentOrderId: 'payment-field-001-caretaker-zhang'
    })

    const getResponse = await app.inject({ method: 'GET', url: '/api/adoptions/adoption-field-001-caretaker-zhang' })

    expect(getResponse.statusCode).toBe(200)
    expect(getResponse.json()).toMatchObject({ fieldId: 'field-001', caretakerId: 'caretaker-zhang' })
  })

  it('returns persisted adoption after creating a new app with the same storage path', async () => {
    const adoptionStoragePath = await createAdoptionStoragePath()
    const firstApp = createApp(createGardenRepository({ adoptionStoragePath }))
    const createResponse = await firstApp.inject({
      method: 'POST',
      url: '/api/adoptions',
      payload: { fieldId: 'field-001', caretakerId: 'caretaker-zhang' }
    })

    expect(createResponse.statusCode).toBe(200)

    const secondApp = createApp(createGardenRepository({ adoptionStoragePath }))
    const getResponse = await secondApp.inject({ method: 'GET', url: '/api/adoptions/adoption-field-001-caretaker-zhang' })

    expect(getResponse.statusCode).toBe(200)
    expect(getResponse.json()).toMatchObject({
      id: 'adoption-field-001-caretaker-zhang',
      fieldId: 'field-001',
      caretakerId: 'caretaker-zhang',
      paymentOrderId: 'payment-field-001-caretaker-zhang'
    })
  })

  it('creates adoption storage file when it does not exist', async () => {
    const adoptionStoragePath = await createAdoptionStoragePath()
    const app = createApp(createGardenRepository({ adoptionStoragePath }))
    const response = await app.inject({
      method: 'POST',
      url: '/api/adoptions',
      payload: { fieldId: 'field-001', caretakerId: 'caretaker-zhang' }
    })

    expect(response.statusCode).toBe(200)
    await expect(access(adoptionStoragePath)).resolves.toBeUndefined()
  })

  it('rejects adoption when field is not idle', async () => {
    const app = createApp()
    const response = await app.inject({
      method: 'POST',
      url: '/api/adoptions',
      payload: { fieldId: 'field-002', caretakerId: 'caretaker-zhang' }
    })

    expect(response.statusCode).toBe(400)
    expect(response.json()).toMatchObject({ message: '该田地已不可认养' })
  })

  it('marks field as adopted after creating adoption', async () => {
    const app = createApp()
    const createResponse = await app.inject({
      method: 'POST',
      url: '/api/adoptions',
      payload: { fieldId: 'field-001', caretakerId: 'caretaker-zhang' }
    })
    const fieldResponse = await app.inject({ method: 'GET', url: '/api/fields/field-001' })

    expect(createResponse.statusCode).toBe(200)
    expect(fieldResponse.statusCode).toBe(200)
    expect(fieldResponse.json()).toMatchObject({
      id: 'field-001',
      status: 'adopted',
      caretaker: { id: 'caretaker-zhang', name: '张叔' }
    })
  })

  it('rejects duplicate adoption for the same field', async () => {
    const app = createApp()
    const firstResponse = await app.inject({
      method: 'POST',
      url: '/api/adoptions',
      payload: { fieldId: 'field-001', caretakerId: 'caretaker-zhang' }
    })
    const secondResponse = await app.inject({
      method: 'POST',
      url: '/api/adoptions',
      payload: { fieldId: 'field-001', caretakerId: 'caretaker-li' }
    })

    expect(firstResponse.statusCode).toBe(200)
    expect(secondResponse.statusCode).toBe(400)
    expect(secondResponse.json()).toMatchObject({ message: '该田地已不可认养' })
  })

  it('returns not found errors', async () => {
    const app = createApp()
    const response = await app.inject({ method: 'GET', url: '/api/fields/missing-field' })

    expect(response.statusCode).toBe(404)
    expect(response.json()).toMatchObject({ message: '田地不存在' })
  })
})
