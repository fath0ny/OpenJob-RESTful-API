import { Pool } from 'pg';
import { nanoid } from 'nanoid';

class DocumentRepositories {
  constructor() {
    this.pool = new Pool();
  }

  async createDocument({
    filename, originalName, path, size, mimetype, uploadedBy,
  }) {
    const id = nanoid(16);
    const createdAt = new Date().toISOString();

    const query = {
      text: `INSERT INTO documents(id, filename, original_name, path, size, mimetype, uploaded_by, created_at)
             VALUES($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`,
      values: [id, filename, originalName, path, size, mimetype, uploadedBy, createdAt],
    };

    const result = await this.pool.query(query);
    return { ...result.rows[0], size: Number(result.rows[0].size) };
  }

  async getDocuments() {
    const result = await this.pool.query(
      'SELECT id, filename, original_name, size, mimetype, uploaded_by, created_at FROM documents ORDER BY created_at DESC'
    );
    return result.rows.map((row) => ({ ...row, size: Number(row.size) }));
  }

  async getDocumentById(id) {
    const query = { text: 'SELECT * FROM documents WHERE id = $1', values: [id] };
    const result = await this.pool.query(query);
    return result.rows[0];
  }

  async deleteDocument(id) {
    const query = { text: 'DELETE FROM documents WHERE id = $1 RETURNING id', values: [id] };
    const result = await this.pool.query(query);
    return result.rows[0];
  }
}

export default new DocumentRepositories();