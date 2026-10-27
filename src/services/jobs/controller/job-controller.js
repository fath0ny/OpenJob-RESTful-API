import JobRepositories from '../repositories/job-repositories.js';
import response from '../../../utils/response.js';
import InvariantError from '../../../exceptions/invariant-error.js';
import NotFoundError from '../../../exceptions/not-found-error.js';

export const createJob = async (req, res, next) => {
  const {
    title, description, companyId, categoryId,
  } = req.validated;

  const job = await JobRepositories.createJob({
    title, description, companyId, categoryId,
  });

  if (!job) {
    return next(new InvariantError('Job gagal ditambahkan'));
  }

  return response(res, 201, 'Job berhasil ditambahkan', { jobId: job.id });
};

export const getJobs = async (req, res) => {
  const { title, 'company-name': companyName } = req.validated;
  const jobs = await JobRepositories.getJobs({ title, companyName });
  return response(res, 200, 'Jobs berhasil ditampilkan', { jobs });
};

export const getJobById = async (req, res, next) => {
  const { id } = req.params;
  const job = await JobRepositories.getJobById(id);

  if (!job) {
    return next(new NotFoundError('Job tidak ditemukan'));
  }

  return response(res, 200, 'Job berhasil ditampilkan', { job });
};

export const getJobsByCompanyId = async (req, res) => {
  const { companyId } = req.params;
  const jobs = await JobRepositories.getJobsByCompanyId(companyId);
  return response(res, 200, 'Jobs berhasil ditampilkan', { jobs });
};

export const getJobsByCategoryId = async (req, res) => {
  const { categoryId } = req.params;
  const jobs = await JobRepositories.getJobsByCategoryId(categoryId);
  return response(res, 200, 'Jobs berhasil ditampilkan', { jobs });
};

export const editJobById = async (req, res, next) => {
  const { id } = req.params;
  const {
    title, description, companyId, categoryId,
  } = req.validated;

  const job = await JobRepositories.editJob({
    id, title, description, companyId, categoryId,
  });

  if (!job) {
    return next(new NotFoundError('Job tidak ditemukan'));
  }

  return response(res, 200, 'Job berhasil diperbarui', { job });
};

export const deleteJobById = async (req, res, next) => {
  const { id } = req.params;
  const deleted = await JobRepositories.deleteJob(id);

  if (!deleted) {
    return next(new NotFoundError('Job tidak ditemukan'));
  }

  return response(res, 200, 'Job berhasil dihapus', { job: deleted });
};