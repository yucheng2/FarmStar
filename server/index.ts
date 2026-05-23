import { join } from 'node:path'
import { createApp } from './app'
import { createGardenRepository } from './repositories/gardenRepository'

const port = Number(process.env.PORT ?? 3000)
const host = process.env.HOST ?? '127.0.0.1'
const adoptionStoragePath = process.env.ADOPTION_STORAGE_PATH ?? join(process.cwd(), '.data/adoptions.json')
const app = createApp(createGardenRepository({ adoptionStoragePath }))

await app.listen({ port, host })
console.log(`FarmStar API listening at http://${host}:${port}`)
