import { Pool } from 'pg';
import { nanoid } from 'nanoid';
import bcrypt from 'bcrypt';
import CacheService from '../../../cache/redis-service.js';

class UserRepositories {
  constructor() {
    this.pool = new Pool();
    this.cacheService = new CacheService();
  }

  async createUser({ name, email, password, role }) {
    const id = nanoid(16);
    const hashedPassword = await bcrypt.hash(password, 10);
    const createdAt = new Date().toISOString();
    const updatedAt = createdAt;

    const query = {
      text: 'INSERT INTO users(id, name, email, password, role, created_at, updated_at) VALUES($1, $2, $3, $4, $5, $6, $7) RETURNING id',
      values: [id, name, email, hashedPassword, role, createdAt, updatedAt],
    };

    const result = await this.pool.query(query);
    return result.rows[0];
  }

  async verifyNewEmail(email) {
    const query = {
      text: 'SELECT email FROM users WHERE email = $1',
      values: [email],
    };
    const result = await this.pool.query(query);
    return result.rows.length > 0;
  }

  async getUserById(id) {
    const cacheKey = `users:${id}`;

    try {
      const cached = await this.cacheService.get(cacheKey);
      return { data: JSON.parse(cached), source: 'cache' };
    } catch (error) {
      const query = {
        text: 'SELECT id, name, email, role, created_at, updated_at FROM users WHERE id = $1',
        values: [id],
      };
      const result = await this.pool.query(query);
      const user = result.rows[0];

      if (user) {
        await this.cacheService.set(cacheKey, JSON.stringify(user));
      }

      return { data: user, source: 'database' };
    }
  }

  async editUser({ id, name, email, role }) {
    const updatedAt = new Date().toISOString();
    const query = {
      text: 'UPDATE users SET name = $1, email = $2, role = $3, updated_at = $4 WHERE id = $5 RETURNING id',
      values: [name, email, role, updatedAt, id],
    };
    const result = await this.pool.query(query);
    const user = result.rows[0];

    if (user) {
      await this.cacheService.delete(`users:${id}`);
    }

    return user;
  }

  async verifyUserCredential(email, password) {
    const query = {
      text: 'SELECT id, password FROM users WHERE email = $1',
      values: [email],
    };

    const user = await this.pool.query(query);
    if (!user.rows.length) {
      return null;
    }

    const { id, password: hashedPassword } = user.rows[0];
    const isPasswordMatch = await bcrypt.compare(password, hashedPassword);

    if (!isPasswordMatch) {
      return null;
    }

    return id;
  }
}

export default new UserRepositories();