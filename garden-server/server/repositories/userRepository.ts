import bcrypt from 'bcryptjs'
import type Database from 'better-sqlite3'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET ?? 'farmstar-dev-secret-key'

export type User = {
  id: string
  username: string
  createdAt: string
}

export type AuthResult = {
  user: User
  token: string
}

export function createUserRepository(db: Database.Database) {
  function createUser(username: string, password: string): AuthResult {
    const existing = db.prepare('SELECT id FROM users WHERE username = ?').get(username)
    if (existing) throw new Error('用户名已存在')

    const id = `user-${Date.now()}`
    const passwordHash = bcrypt.hashSync(password, 10)
    const createdAt = new Date().toISOString()

    db.prepare('INSERT INTO users (id, username, password_hash, created_at) VALUES (?, ?, ?, ?)')
      .run(id, username, passwordHash, createdAt)

    const token = jwt.sign({ userId: id, username }, JWT_SECRET, { expiresIn: '7d' })

    return {
      user: { id, username, createdAt },
      token
    }
  }

  function login(username: string, password: string): AuthResult {
    const row = db.prepare('SELECT * FROM users WHERE username = ?').get(username) as
      | { id: string; username: string; password_hash: string; created_at: string }
      | undefined

    if (!row) throw new Error('用户名或密码错误')

    const valid = bcrypt.compareSync(password, row.password_hash)
    if (!valid) throw new Error('用户名或密码错误')

    const token = jwt.sign({ userId: row.id, username }, JWT_SECRET, { expiresIn: '7d' })

    return {
      user: { id: row.id, username: row.username, createdAt: row.created_at },
      token
    }
  }

  function verifyToken(token: string): { userId: string; username: string } {
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as { userId: string; username: string }
      return decoded
    } catch {
      throw new Error('无效的 token')
    }
  }

  function getUserById(userId: string): User | null {
    const row = db.prepare('SELECT id, username, created_at FROM users WHERE id = ?').get(userId) as
      | { id: string; username: string; created_at: string }
      | undefined

    if (!row) return null

    return {
      id: row.id,
      username: row.username,
      createdAt: row.created_at
    }
  }

  function changePassword(userId: string, currentPassword: string, newPassword: string): { success: boolean } {
    const row = db.prepare('SELECT password_hash FROM users WHERE id = ?').get(userId) as
      | { password_hash: string }
      | undefined

    if (!row) throw new Error('用户不存在')

    const valid = bcrypt.compareSync(currentPassword, row.password_hash)
    if (!valid) throw new Error('当前密码错误')

    const newHash = bcrypt.hashSync(newPassword, 10)
    db.prepare('UPDATE users SET password_hash = ? WHERE id = ?').run(newHash, userId)

    return { success: true }
  }

  return { createUser, login, verifyToken, getUserById, changePassword }
}

export type UserRepository = ReturnType<typeof createUserRepository>
