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
  pgm.addColumns('jobs', {
    job_type: { type: 'VARCHAR(30)' },
    experience_level: { type: 'VARCHAR(30)' },
    location_type: { type: 'VARCHAR(30)' },
    location_city: { type: 'TEXT' },
    salary_min: { type: 'BIGINT' },
    salary_max: { type: 'BIGINT' },
    is_salary_visible: { type: 'BOOLEAN', notNull: true, default: false },
    status: { type: 'VARCHAR(20)', notNull: true, default: 'open' },
  });
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
export const down = (pgm) => {
  pgm.dropColumns('jobs', [
    'job_type', 'experience_level', 'location_type', 'location_city',
    'salary_min', 'salary_max', 'is_salary_visible', 'status',
  ]);
};
