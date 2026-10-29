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
      const query = {
        text: `                                                                                                                                                                                                                        
         SELECT                                                                                                                                                                                                                       
           bookmarks.*,                                                                                                                                                                                                               
           jobs.company_id,                                                                                                                                                                                                           
           jobs.category_id,                                                                                                                                                                                                          
           jobs.title AS job_title,                                                                                                                                                                                                   
           jobs.description AS job_description,                                                                                                                                                                                       
           jobs.location_city AS job_location,                                                                                                                                                                                        
           jobs.salary_min,                                                                                                                                                                                                           
           jobs.salary_max,                                                                                                                                                                                                           
           jobs.job_type,                                                                                                                                                                                                             
           jobs.created_at AS job_created_at,                                                                                                                                                                                         
           jobs.updated_at AS job_updated_at,                                                                                                                                                                                         
           companies.name AS company_name,                                                                                                                                                                                            
           companies.description AS company_description,                                                                                                                                                                              
           companies.location AS company_location,                                                                                                                                                                                    
           companies.created_at AS company_created_at                                                                                                                                                                                 
         FROM bookmarks                                                                                                                                                                                                               
         LEFT JOIN jobs ON jobs.id = bookmarks.job_id                                                                                                                                                                                 
         LEFT JOIN companies ON companies.id = jobs.company_id                                                                                                                                                                        
         WHERE bookmarks.user_id = $1                                                                                                                                                                                                 
         ORDER BY bookmarks.created_at DESC                                                                                                                                                                                           
       `,
        values: [userId],
      };
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