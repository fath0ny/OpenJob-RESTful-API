import ApplicationRepositories from '../repositories/application-repositories.js';
import ApplicationQueueService from '../producers/application-queue-service.js';
import response from '../../../utils/response.js';
import InvariantError from '../../../exceptions/invariant-error.js';
import NotFoundError from '../../../exceptions/not-found-error.js';

export const createApplication = async (req, res, next) => {
  const { job_id: jobId } = req.validated;
  const { id: userId } = req.user;

  const application = await ApplicationRepositories.createApplication({ jobId, userId });
  if (!application) {
    return next(new InvariantError('Lamaran gagal ditambahkan'));
  }

  ApplicationQueueService.publishNewApplication(application.id)
    .catch((error) => console.error('Gagal publish ke RabbitMQ:', error.message));

  return response(res, 201, 'Lamaran berhasil ditambahkan', application);
};

export const getApplications = async (req, res) => {
  const applications = await ApplicationRepositories.getApplications();
  return response(res, 200, 'Applications berhasil ditampilkan', { applications });
};

export const getApplicationById = async (req, res, next) => {
  const { id } = req.params;
  const { data: application, source } = await ApplicationRepositories.getApplicationById(id);

  if (!application) {
    return next(new NotFoundError('Application tidak ditemukan'));
  }

  res.set('X-Data-Source', source);
  return response(res, 200, 'Application berhasil ditampilkan', application);
};

export const getApplicationsByUserId = async (req, res) => {
  const { userId } = req.params;
  const { data: applications, source } = await ApplicationRepositories.getApplicationsByUserId(userId);

  res.set('X-Data-Source', source);
  return response(res, 200, 'Applications berhasil ditampilkan', { applications });
};

export const getApplicationsByJobId = async (req, res) => {
  const { jobId } = req.params;
  const { data: applications, source } = await ApplicationRepositories.getApplicationsByJobId(jobId);

  res.set('X-Data-Source', source);
  return response(res, 200, 'Applications berhasil ditampilkan', { applications });
};

export const editApplicationStatus = async (req, res, next) => {
  const { id } = req.params;
  const { status } = req.validated;

  const application = await ApplicationRepositories.editApplicationStatus({ id, status });
  if (!application) {
    return next(new NotFoundError('Application tidak ditemukan'));
  }

  return response(res, 200, 'Status lamaran berhasil diperbarui', application);
};

export const deleteApplicationById = async (req, res, next) => {
  const { id } = req.params;
  const deleted = await ApplicationRepositories.deleteApplication(id);

  if (!deleted) {
    return next(new NotFoundError('Application tidak ditemukan'));
  }

  return response(res, 200, 'Application berhasil dihapus', { application: deleted });
};