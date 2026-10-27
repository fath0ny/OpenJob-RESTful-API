import CompanyRepositories from '../repositories/company-repositories.js';
import response from '../../../utils/response.js';
import InvariantError from '../../../exceptions/invariant-error.js';
import NotFoundError from '../../../exceptions/not-found-error.js';

export const createCompany = async (req, res, next) => {
  const { name, description, location } = req.validated;
  const { id: owner } = req.user;

  const company = await CompanyRepositories.createCompany({ name, description, location, owner });
  if (!company) {
    return next(new InvariantError('Company gagal ditambahkan'));
  }

  return response(res, 201, 'Company berhasil ditambahkan', { companyId: company.id });
};

export const getCompanies = async (req, res) => {
  const companies = await CompanyRepositories.getCompanies();
  return response(res, 200, 'Companies berhasil ditampilkan', { companies });
};

export const getCompanyById = async (req, res, next) => {
  const { id } = req.params;
  const company = await CompanyRepositories.getCompanyById(id);

  if (!company) {
    return next(new NotFoundError('Company tidak ditemukan'));
  }

  return response(res, 200, 'Company berhasil ditampilkan', { company });
};

export const editCompanyById = async (req, res, next) => {
  const { id } = req.params;
  const { name, description, location } = req.validated;

  const company = await CompanyRepositories.editCompany({ id, name, description, location });
  if (!company) {
    return next(new NotFoundError('Company tidak ditemukan'));
  }

  return response(res, 200, 'Company berhasil diperbarui', { company });
};

export const deleteCompanyById = async (req, res, next) => {
  const { id } = req.params;
  const deleted = await CompanyRepositories.deleteCompany(id);

  if (!deleted) {
    return next(new NotFoundError('Company tidak ditemukan'));
  }

  return response(res, 200, 'Company berhasil dihapus', { company: deleted });
};