import { Pool } from 'pg';
import { nanoid } from 'nanoid';

class JobRepositories {
  constructor() {
    this.pool = new Pool();
  }

  async createJob({
    title, description, companyId, categoryId, jobType, experienceLevel,
    locationType, locationCity, salaryMin, salaryMax, isSalaryVisible, status,
  }) {
    const id = nanoid(16);
    const createdAt = new Date().toISOString();
    const updatedAt = createdAt;

    const query = {
      text: `INSERT INTO jobs(
        id, title, description, company_id, category_id, job_type, experience_level,
        location_type, location_city, salary_min, salary_max, is_salary_visible,
        status, created_at, updated_at
      ) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15) RETURNING id`,
      values: [
        id, title, description, companyId, categoryId, jobType, experienceLevel,
        locationType, locationCity, salaryMin, salaryMax, isSalaryVisible,
        status, createdAt, updatedAt,
      ],
    };

    const result = await this.pool.query(query);
    return result.rows[0];
  }

  async getJobs({ title, companyName } = {}) {
    let text = `                                                                                                                                                                                                      
      SELECT                                                                                                                                                                                                                       
        jobs.id,                                                                                                                                                                                                                   
        jobs.company_id,                                                                                                                                                                                                           
        jobs.category_id,                                                                                                                                                                                                          
        jobs.title,                                                                                                                                                                                                                
        jobs.description,                                                                                                                                                                                                          
        jobs.location_city AS location,                                                                                                                                                                                            
        jobs.salary_min,                                                                                                                                                                                                           
        jobs.salary_max,                                                                                                                                                                                                           
        jobs.job_type,                                                                                                                                                                                                             
        jobs.created_at,                                                                                                                                                                                                           
        jobs.updated_at,                                                                                                                                                                                                           
        companies.name AS company_name,                                                                                                                                                                                            
        companies.location AS company_location                                                                                                                                                                                     
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

    text += ' ORDER BY jobs.created_at DESC';

    const result = await this.pool.query({ text, values });
    return result.rows;
  }

  async getJobById(id) {
    const query = { text: 'SELECT * FROM jobs WHERE id = $1', values: [id] };
    const result = await this.pool.query(query);
    return result.rows[0];
  }

  async getJobsByCompanyId(companyId) {
    const query = { text: 'SELECT * FROM jobs WHERE company_id = $1', values: [companyId] };
    const result = await this.pool.query(query);
    return result.rows;
  }

  async getJobsByCategoryId(categoryId) {
    const query = { text: 'SELECT * FROM jobs WHERE category_id = $1', values: [categoryId] };
    const result = await this.pool.query(query);
    return result.rows;
  }

  async editJob({
    id, title, description, companyId, categoryId, jobType, experienceLevel,
    locationType, locationCity, salaryMin, salaryMax, isSalaryVisible, status,
  }) {
    const updatedAt = new Date().toISOString();
    const query = {
      text: `UPDATE jobs SET
        title = $1, description = $2, company_id = $3, category_id = $4, job_type = $5,
        experience_level = $6, location_type = $7, location_city = $8, salary_min = $9,
        salary_max = $10, is_salary_visible = $11, status = $12, updated_at = $13
        WHERE id = $14 RETURNING id`,
      values: [
        title, description, companyId, categoryId, jobType, experienceLevel,
        locationType, locationCity, salaryMin, salaryMax, isSalaryVisible,
        status, updatedAt, id,
      ],
    };
    const result = await this.pool.query(query);
    return result.rows[0];
  }

  async deleteJob(id) {
    const query = { text: 'DELETE FROM jobs WHERE id = $1 RETURNING id', values: [id] };
    const result = await this.pool.query(query);
    return result.rows[0];
  }
}

export default new JobRepositories();