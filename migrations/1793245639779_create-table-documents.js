/**
 * @type {import('node-pg-migrate').ColumnDefinitions | undefined}
 */
export const shorthands = undefined;

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
/* eslint-disable camelcase */
export const up = (pgm) => {
  pgm.createTable('documents', {
    id: { type: 'VARCHAR(50)', primaryKey: true },
    filename: { type: 'TEXT', notNull: true },
    original_name: { type: 'TEXT', notNull: true },
    path: { type: 'TEXT', notNull: true },
    size: { type: 'BIGINT', notNull: true },
    mimetype: { type: 'VARCHAR(100)' },
    uploaded_by: {
      type: 'VARCHAR(50)',
      references: 'users',
      onDelete: 'SET NULL',
    },
    created_at: { type: 'TEXT', notNull: true },
  });
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
export const down = (pgm) => {
  pgm.dropTable('documents');
};
