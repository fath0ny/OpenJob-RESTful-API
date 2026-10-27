import { Pool } from 'pg';
import { nanoid } from 'nanoid';

class BookmarkRepositories {
  constructor() {
    this.pool = new Pool();
  }

  async createBookmark({ jobId, userId }) {
    const id = nanoid(16);
    const createdAt = new Date().toISOString();

    const query = {
      text: 'INSERT INTO bookmarks(id, job_id, user_id, created_at) VALUES($1, $2, $3, $4) RETURNING id',
      values: [id, jobId, userId, createdAt],
    };

    const result = await this.pool.query(query);
    return result.rows[0];
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
    const query = {
      text: 'SELECT * FROM bookmarks WHERE user_id = $1',
      values: [userId],
    };
    const result = await this.pool.query(query);
    return result.rows;
  }

  async deleteBookmarkByUserAndJob(jobId, userId) {
    const query = {
      text: 'DELETE FROM bookmarks WHERE job_id = $1 AND user_id = $2 RETURNING id',
      values: [jobId, userId],
    };
    const result = await this.pool.query(query);
    return result.rows[0];
  }
}

export default new BookmarkRepositories();