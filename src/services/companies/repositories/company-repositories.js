import { Pool } from 'pg';
import { nanoid } from 'nanoid';

class CompanyRepositories {
  constructor() {
    this.pool = new Pool();
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
    return result.rows[0];
  }

  async getCompanies() {
    const result = await this.pool.query('SELECT * FROM companies');
    return result.rows;
  }

  async getCompanyById(id) {
    const query = {
      text: 'SELECT * FROM companies WHERE id = $1',
      values: [id],
    };
    const result = await this.pool.query(query);
    return result.rows[0];
  }

  async editCompany({ id, name, description, location }) {
    const updatedAt = new Date().toISOString();
    const query = {
      text: 'UPDATE companies SET name = $1, description = $2, location = $3, updated_at = $4 WHERE id = $5 RETURNING id',
      values: [name, description, location, updatedAt, id],
    };
    const result = await this.pool.query(query);
    return result.rows[0];
  }

  async deleteCompany(id) {
    const query = {
      text: 'DELETE FROM companies WHERE id = $1 RETURNING id',
      values: [id],
    };
    const result = await this.pool.query(query);
    return result.rows[0];
  }
}

export default new CompanyRepositories();