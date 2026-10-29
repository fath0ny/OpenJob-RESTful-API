import { Pool } from 'pg';
import { nanoid } from 'nanoid';
import CacheService from '../../../cache/redis-service.js';

class BookmarkRepositories {
  constructor() {
    this.pool = new Pool();
    this.cacheService = new CacheService();
  }

  async createBookmark({ jobId, userId }) {
    const id = nanoid(16);
    const createdAt = new Date().toISOString();

    const query = {
      text: 'INSERT INTO bookmarks(id, job_id, user_id, created_at) VALUES($1, $2, $3, $4) RETURNING id',
      values: [id, jobId, userId, createdAt],
    };

    const result = await this.pool.query(query);
    const bookmark = result.rows[0];

    if (bookmark) {
      await this.cacheService.delete(`bookmarks:${userId}`);
    }

    return bookmark;
  }

  async getBookmarkById(jobId, id) {
    const query = {
      text: 'SELECT * FROM bookmarks WHERE job_id = $1 AND id = $2',
      values: [jobId, id],
    };
    const result = await this.pool.query(query);
    return result.rows[0];
  }

  async getBookmarksByUser(userId) {
    const cacheKey = `bookmarks:${userId}`;

    try {
      const cached = await this.cacheService.get(cacheKey);
      return { data: JSON.parse(cached), source: 'cache' };
    } catch (error) {
      const query = { text: 'SELECT * FROM bookmarks WHERE user_id = $1', values: [userId] };
      const result = await this.pool.query(query);

      await this.cacheService.set(cacheKey, JSON.stringify(result.rows));

      return { data: result.rows, source: 'database' };
    }
  }

  async deleteBookmarkByUserAndJob(jobId, userId) {
    const query = {
      text: 'DELETE FROM bookmarks WHERE job_id = $1 AND user_id = $2 RETURNING id',
      values: [jobId, userId],
    };
    const result = await this.pool.query(query);
    const deleted = result.rows[0];

    if (deleted) {
      await this.cacheService.delete(`bookmarks:${userId}`);
    }

    return deleted;
  }
}

export default new BookmarkRepositories();