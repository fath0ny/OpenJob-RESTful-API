import { Pool } from 'pg';
import { nanoid } from 'nanoid';

class JobRepositories {
  constructor() {
    this.pool = new Pool();
  }

  async createJob({ title, description, companyId, categoryId }) {
    const id = nanoid(16);
    const createdAt = new Date().toISOString();
    const updatedAt = createdAt;

    const query = {
      text: 'INSERT INTO jobs(id, title, description, company_id, category_id, created_at, updated_at) VALUES($1, $2, $3, $4, $5, $6, $7) RETURNING id',
      values: [id, title, description, companyId, categoryId, createdAt, updatedAt],
    };

    const result = await this.pool.query(query);
    return result.rows[0];
  }

  async getJobs({ title, companyName } = {}) {
    let text = `
      SELECT jobs.*, companies.name AS company_name
      FROM jobs
      LEFT JOIN companies ON companies.id = jobs.company_id
      WHERE 1=1
    `;
    const values = [];

    if (title) {
      values.push(`%${title}%`);
      text += ` AND jobs.title ILIKE $${values.length}`;
    }

    if (companyName) {
      values.push(`%${companyName}%`);
      text += ` AND companies.name ILIKE $${values.length}`;
    }

    const result = await this.pool.query({ text, values });
    return result.rows;
  }

  async getJobById(id) {
    const query = {
      text: 'SELECT * FROM jobs WHERE id = $1',
      values: [id],
    };
    const result = await this.pool.query(query);
    return result.rows[0];
  }

  async getJobsByCompanyId(companyId) {
    const query = {
      text: 'SELECT * FROM jobs WHERE company_id = $1',
      values: [companyId],
    };
    const result = await this.pool.query(query);
    return result.rows;
  }

  async getJobsByCategoryId(categoryId) {
    const query = {
      text: 'SELECT * FROM jobs WHERE category_id = $1',
      values: [categoryId],
    };
    const result = await this.pool.query(query);
    return result.rows;
  }

  async editJob({
    id, title, description, companyId, categoryId,
  }) {
    const updatedAt = new Date().toISOString();
    const query = {
      text: 'UPDATE jobs SET title = $1, description = $2, company_id = $3, category_id = $4, updated_at = $5 WHERE id = $6 RETURNING id',
      values: [title, description, companyId, categoryId, updatedAt, id],
    };
    const result = await this.pool.query(query);
    return result.rows[0];
  }

  async deleteJob(id) {
    const query = {
      text: 'DELETE FROM jobs WHERE id = $1 RETURNING id',
      values: [id],
    };
    const result = await this.pool.query(query);
    return result.rows[0];
  }
}

export default new JobRepositories();