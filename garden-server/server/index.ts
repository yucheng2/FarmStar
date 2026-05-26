import { createApp } from './app'
import { getDatabase } from './database/connection'
import { seedDatabase } from './database/seed'
import { createGardenRepository } from './repositories/gardenRepository'
import { createUserRepository } from './repositories/userRepository'

const port = Number(process.env.PORT ?? 3000)
const host = process.env.HOST ?? '127.0.0.1'

const db = getDatabase('./server/database/data/farmstar.db')
seedDatabase(db)
const gardenRepo = createGardenRepository({ db })
const userRepo = createUserRepository(db)
const app = createApp(gardenRepo, userRepo)

await app.listen({ port, host })
console.log(`FarmStar API listening at http://${host}:${port}`)
