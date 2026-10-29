import { Pool } from 'pg';
import { nanoid } from 'nanoid';
import CacheService from '../../../cache/redis-service.js';
import InvariantError from '../../../exceptions/invariant-error.js';
import NotFoundError from '../../../exceptions/not-found-error.js';

class ApplicationRepositories {
  constructor() {
    this.pool = new Pool();
    this.cacheService = new CacheService();
  }

  async createApplication({ jobId, userId }) {
    const id = nanoid(16);
    const createdAt = new Date().toISOString();
    const updatedAt = createdAt;

    const query = {
      text: 'INSERT INTO applications(id, job_id, user_id, status, created_at, updated_at) VALUES($1, $2, $3, $4, $5, $6) RETURNING *',
      values: [id, jobId, userId, 'pending', createdAt, updatedAt],
    };

    try {
      const result = await this.pool.query(query);
      const application = result.rows[0];

      await this.cacheService.delete(`applications:user:${userId}`);
      await this.cacheService.delete(`applications:job:${jobId}`);

      return application;
    } catch (error) {
      if (error.code === '23505') {
        throw new InvariantError('Anda sudah pernah melamar untuk pekerjaan ini');
      }
      if (error.code === '23503') {
        throw new NotFoundError('Job tidak ditemukan');
      }
      throw error;
    }
  }

  async getApplications() {
    const result = await this.pool.query(`                                                                                                                                                                                           
       SELECT                                                                                                                                                                                                                         
         applications.id,                                                                                                                                                                                                             
         applications.job_id,                                                                                                                                                                                                         
         applications.user_id,                                                                                                                                                                                                        
         applications.status,                                                                                                                                                                                                         
         applications.document_name,                                                                                                                                                                                                  
         applications.created_at,                                                                                                                                                                                                     
         applications.updated_at,                                                                                                                                                                                                     
         users.name AS user_name,                                                                                                                                                                                                     
         jobs.title AS job_title,                                                                                                                                                                                                     
         jobs.location_city AS job_location,                                                                                                                                                                                          
         jobs.job_type AS job_type,                                                                                                                                                                                                   
         companies.name AS company_name,                                                                                                                                                                                              
         jobs.company_id AS company_id                                                                                                                                                                                                
       FROM applications                                                                                                                                                                                                              
       LEFT JOIN users ON users.id = applications.user_id                                                                                                                                                                             
       LEFT JOIN jobs ON jobs.id = applications.job_id                                                                                                                                                                                
       LEFT JOIN companies ON companies.id = jobs.company_id                                                                                                                                                                          
       ORDER BY applications.created_at DESC                                                                                                                                                                                          
     `);
    return result.rows;
  }

  async getApplicationById(id) {
    const cacheKey = `applications:${id}`;

    try {
      const cached = await this.cacheService.get(cacheKey);
      return { data: JSON.parse(cached), source: 'cache' };
    } catch (error) {
      const query = { text: 'SELECT * FROM applications WHERE id = $1', values: [id] };
      const result = await this.pool.query(query);
      const application = result.rows[0];

      if (application) {
        await this.cacheService.set(cacheKey, JSON.stringify(application));
      }

      return { data: application, source: 'database' };
    }
  }

  async getApplicationsByUserId(userId) {
    const cacheKey = `applications:user:${userId}`;

    try {
      const cached = await this.cacheService.get(cacheKey);
      return { data: JSON.parse(cached), source: 'cache' };
    } catch (error) {
      const query = {
        text: `                                                                                                                                                                                                                        
         SELECT                                                                                                                                                                                                                       
           applications.id,                                                                                                                                                                                                           
           applications.job_id,                                                                                                                                                                                                       
           applications.user_id,                                                                                                                                                                                                      
           applications.status,                                                                                                                                                                                                       
           applications.document_name,                                                                                                                                                                                                
           applications.created_at,                                                                                                                                                                                                   
           applications.updated_at,                                                                                                                                                                                                   
           users.name AS user_name,                                                                                                                                                                                                   
           jobs.title AS job_title,                                                                                                                                                                                                   
           jobs.location_city AS job_location,                                                                                                                                                                                        
           jobs.job_type AS job_type,                                                                                                                                                                                                 
           jobs.salary_min,                                                                                                                                                                                                           
           jobs.salary_max,                                                                                                                                                                                                           
           companies.name AS company_name,                                                                                                                                                                                            
           jobs.company_id AS company_id                                                                                                                                                                                              
         FROM applications                                                                                                                                                                                                            
         LEFT JOIN users ON users.id = applications.user_id                                                                                                                                                                           
         LEFT JOIN jobs ON jobs.id = applications.job_id                                                                                                                                                                              
         LEFT JOIN companies ON companies.id = jobs.company_id                                                                                                                                                                        
         WHERE applications.user_id = $1                                                                                                                                                                                              
         ORDER BY applications.created_at DESC                                                                                                                                                                                        
       `,
        values: [userId],
      };
      const result = await this.pool.query(query);

      await this.cacheService.set(cacheKey, JSON.stringify(result.rows));

      return { data: result.rows, source: 'database' };
    }
  }

  async getApplicationsByJobId(jobId) {
    const cacheKey = `applications:job:${jobId}`;

    try {
      const cached = await this.cacheService.get(cacheKey);
      return { data: JSON.parse(cached), source: 'cache' };
    } catch (error) {
      const query = { text: 'SELECT * FROM applications WHERE job_id = $1', values: [jobId] };
      const result = await this.pool.query(query);

      await this.cacheService.set(cacheKey, JSON.stringify(result.rows));

      return { data: result.rows, source: 'database' };
    }
  }

  async editApplicationStatus({ id, status }) {
    const updatedAt = new Date().toISOString();
    const query = {
      text: 'UPDATE applications SET status = $1, updated_at = $2 WHERE id = $3 RETURNING *',
      values: [status, updatedAt, id],
    };
    const result = await this.pool.query(query);
    const application = result.rows[0];

    if (application) {
      await this.cacheService.delete(`applications:${application.id}`);
      await this.cacheService.delete(`applications:user:${application.user_id}`);
      await this.cacheService.delete(`applications:job:${application.job_id}`);
    }

    return application;
  }

  async deleteApplication(id) {
    const query = {
      text: 'DELETE FROM applications WHERE id = $1 RETURNING *',
      values: [id],
    };
    const result = await this.pool.query(query);
    const deleted = result.rows[0];

    if (deleted) {
      await this.cacheService.delete(`applications:${deleted.id}`);
      await this.cacheService.delete(`applications:user:${deleted.user_id}`);
      await this.cacheService.delete(`applications:job:${deleted.job_id}`);
    }

    return deleted;
  }
}

export default new ApplicationRepositories();