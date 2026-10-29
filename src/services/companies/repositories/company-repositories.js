import { Pool } from 'pg';
import { nanoid } from 'nanoid';
import CacheService from '../../../cache/redis-service.js';

class CompanyRepositories {
  constructor() {
    this.pool = new Pool();
    this.cacheService = new CacheService();
  }

  async createCompany({ name, description, location, owner }) {
    const id = nanoid(16);
    const createdAt = new Date().toISOString();
    const updatedAt = createdAt;

    const query = {
      text: 'INSERT INTO companies(id, name, description, location, owner, created_at, updated_at) VALUES($1, $2, $3, $4, $5, $6, $7) RETURNING id',
      values: [id, name, description, location, owner, createdAt, updatedAt],
    };

    const result = await this.pool.query(query);
    const company = result.rows[0];

    if (company) {
      await this.cacheService.delete(`companies:${company.id}`);
    }

    return company;
  }

  async getCompanies() {
    const result = await this.pool.query(
      `SELECT id, name, description, location, owner, created_at                                                                                                                                                                     
        FROM companies                                                                                                                                                                                                                
        ORDER BY created_at DESC`
    );
    return result.rows;
  }

  async getCompanyById(id) {
    const cacheKey = `companies:${id}`;

    try {
      const cached = await this.cacheService.get(cacheKey);
      return { data: JSON.parse(cached), source: 'cache' };
    } catch (error) {
      const query = { text: 'SELECT * FROM companies WHERE id = $1', values: [id] };
      const result = await this.pool.query(query);
      const company = result.rows[0];

      if (company) {
        await this.cacheService.set(cacheKey, JSON.stringify(company));
      }

      return { data: company, source: 'database' };
    }
  }

  async editCompany({ id, name, description, location }) {
    const updatedAt = new Date().toISOString();
    const query = {
      text: 'UPDATE companies SET name = $1, description = $2, location = $3, updated_at = $4 WHERE id = $5 RETURNING id',
      values: [name, description, location, updatedAt, id],
    };
    const result = await this.pool.query(query);
    const company = result.rows[0];

    if (company) {
      await this.cacheService.delete(`companies:${id}`);
    }

    return company;
  }

  async deleteCompany(id) {
    const query = {
      text: 'DELETE FROM companies WHERE id = $1 RETURNING id',
      values: [id],
    };
    const result = await this.pool.query(query);
    const deleted = result.rows[0];

    if (deleted) {
      await this.cacheService.delete(`companies:${id}`);
    }

    return deleted;
  }
}

export default new CompanyRepositories();