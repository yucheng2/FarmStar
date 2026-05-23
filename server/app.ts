import Fastify from 'fastify'
import { createGardenRepository, type GardenRepository } from './repositories/gardenRepository'
import type { CaretakerFilters, CreateAdoptionInput, FieldFilters } from '../src/types/garden'

type ErrorBody = {
  message: string
}

function sendError(reply: { code: (statusCode: number) => { send: (body: ErrorBody) => void } }, caughtError: unknown, statusCode = 400) {
  const message = caughtError instanceof Error ? caughtError.message : '请求失败'
  reply.code(statusCode).send({ message })
}

export function createApp(repository: GardenRepository = createGardenRepository()) {
  const app = Fastify({ logger: false })

  app.addHook('onRequest', async (_request, reply) => {
    reply.header('Access-Control-Allow-Origin', '*')
    reply.header('Access-Control-Allow-Methods', 'GET,POST,OPTIONS')
    reply.header('Access-Control-Allow-Headers', 'Content-Type')
  })

  app.options('/*', async (_request, reply) => {
    reply.code(204).send()
  })

  app.get('/api/fields', async (request) => {
    return repository.getFields(request.query as FieldFilters)
  })

  app.get<{ Params: { fieldId: string } }>('/api/fields/:fieldId', async (request, reply) => {
    try {
      return repository.getFieldById(request.params.fieldId)
    } catch (caughtError) {
      sendError(reply, caughtError, 404)
    }
  })

  app.get<{ Params: { fieldId: string } }>('/api/fields/:fieldId/recommended-caretakers', async (request, reply) => {
    try {
      return repository.getRecommendedCaretakers(request.params.fieldId)
    } catch (caughtError) {
      sendError(reply, caughtError, 404)
    }
  })

  app.get('/api/caretakers', async (request) => {
    return repository.getCaretakers(request.query as CaretakerFilters)
  })

  app.get<{ Params: { caretakerId: string } }>('/api/caretakers/:caretakerId', async (request, reply) => {
    try {
      return repository.getCaretakerById(request.params.caretakerId)
    } catch (caughtError) {
      sendError(reply, caughtError, 404)
    }
  })

  app.post<{ Body: CreateAdoptionInput }>('/api/adoptions', async (request, reply) => {
    try {
      return repository.createAdoption(request.body)
    } catch (caughtError) {
      sendError(reply, caughtError)
    }
  })

  app.get<{ Params: { adoptionId: string } }>('/api/adoptions/:adoptionId', async (request, reply) => {
    try {
      return repository.getAdoptionById(request.params.adoptionId)
    } catch (caughtError) {
      sendError(reply, caughtError, 404)
    }
  })

  return app
}
