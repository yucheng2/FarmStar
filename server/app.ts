import Fastify from 'fastify'
import { getDatabase } from './database/connection'
import { seedDatabase } from './database/seed'
import { createGardenRepository, type GardenRepository } from './repositories/gardenRepository'
import { createUserRepository, type UserRepository } from './repositories/userRepository'
import type { CaretakerFilters, CreateAdoptionInput, FieldFilters } from '../src/types/garden'

type ErrorBody = {
  message: string
}

function sendError(reply: { code: (statusCode: number) => { send: (body: ErrorBody) => void } }, caughtError: unknown, statusCode = 400) {
  const message = caughtError instanceof Error ? caughtError.message : '请求失败'
  reply.code(statusCode).send({ message })
}

export function createApp(gardenRepo?: GardenRepository, userRepo?: UserRepository) {
  const app = Fastify({ logger: false })

  let gRepo = gardenRepo
  let uRepo = userRepo

  if (!gRepo || !uRepo) {
    const db = getDatabase()
    seedDatabase(db)
    gRepo = gRepo ?? createGardenRepository({ db })
    uRepo = uRepo ?? createUserRepository(db)
  }

  app.addHook('onRequest', async (_request, reply) => {
    reply.header('Access-Control-Allow-Origin', '*')
    reply.header('Access-Control-Allow-Methods', 'GET,POST,OPTIONS')
    reply.header('Access-Control-Allow-Headers', 'Content-Type,Authorization')
  })

  app.options('/*', async (_request, reply) => {
    reply.code(204).send()
  })

  // Auth routes
  app.post<{ Body: { username: string; password: string } }>('/api/auth/register', async (request, reply) => {
    try {
      return uRepo!.createUser(request.body.username, request.body.password)
    } catch (caughtError) {
      sendError(reply, caughtError)
    }
  })

  app.post<{ Body: { username: string; password: string } }>('/api/auth/login', async (request, reply) => {
    try {
      return uRepo!.login(request.body.username, request.body.password)
    } catch (caughtError) {
      sendError(reply, caughtError)
    }
  })

  // Protected routes helper
  function getUserId(request: { headers: { authorization?: string } }): string {
    const auth = request.headers.authorization
    if (!auth || !auth.startsWith('Bearer ')) throw new Error('未登录')
    const token = auth.slice(7)
    const decoded = uRepo!.verifyToken(token)
    return decoded.userId
  }

  // Garden routes
  app.get('/api/fields', async (request) => {
    return gRepo!.getFields(request.query as FieldFilters)
  })

  app.get<{ Params: { fieldId: string } }>('/api/fields/:fieldId', async (request, reply) => {
    try {
      return gRepo!.getFieldById(request.params.fieldId)
    } catch (caughtError) {
      sendError(reply, caughtError, 404)
    }
  })

  app.get<{ Params: { fieldId: string } }>('/api/fields/:fieldId/recommended-caretakers', async (request, reply) => {
    try {
      return gRepo!.getRecommendedCaretakers(request.params.fieldId)
    } catch (caughtError) {
      sendError(reply, caughtError, 404)
    }
  })

  app.get('/api/caretakers', async (request) => {
    return gRepo!.getCaretakers(request.query as CaretakerFilters)
  })

  app.get<{ Params: { caretakerId: string } }>('/api/caretakers/:caretakerId', async (request, reply) => {
    try {
      return gRepo!.getCaretakerById(request.params.caretakerId)
    } catch (caughtError) {
      sendError(reply, caughtError, 404)
    }
  })

  app.get('/api/adoptions', async (request, reply) => {
    try {
      const userId = getUserId(request)
      return gRepo!.getAdoptions({ userId })
    } catch (caughtError) {
      sendError(reply, caughtError, 401)
    }
  })

  app.post<{ Body: CreateAdoptionInput }>('/api/adoptions', async (request, reply) => {
    try {
      const userId = getUserId(request)
      return gRepo!.createAdoption({ ...request.body, userId })
    } catch (caughtError) {
      const message = caughtError instanceof Error ? caughtError.message : '请求失败'
      const statusCode = message === '未登录' || message === '无效的 token' ? 401 : 400
      sendError(reply, caughtError, statusCode)
    }
  })

  app.get<{ Params: { adoptionId: string } }>('/api/adoptions/:adoptionId', async (request, reply) => {
    try {
      getUserId(request)
      return gRepo!.getAdoptionById(request.params.adoptionId)
    } catch (caughtError) {
      sendError(reply, caughtError, 404)
    }
  })

  return app
}
