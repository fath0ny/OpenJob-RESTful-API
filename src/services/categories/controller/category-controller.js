import CategoryRepositories from '../repositories/category-repositories.js';
import response from '../../../utils/response.js';
import InvariantError from '../../../exceptions/invariant-error.js';
import NotFoundError from '../../../exceptions/not-found-error.js';

export const createCategory = async (req, res, next) => {
  const { name } = req.validated;

  const category = await CategoryRepositories.createCategory({ name });
  if (!category) {
    return next(new InvariantError('Category gagal ditambahkan'));
  }

  return response(res, 201, 'Category berhasil ditambahkan', { categoryId: category.id });
};

export const getCategories = async (req, res) => {
  const categories = await CategoryRepositories.getCategories();
  return response(res, 200, 'Categories berhasil ditampilkan', { categories });
};

export const getCategoryById = async (req, res, next) => {
  const { id } = req.params;
  const category = await CategoryRepositories.getCategoryById(id);

  if (!category) {
    return next(new NotFoundError('Category tidak ditemukan'));
  }

  return response(res, 200, 'Category berhasil ditampilkan', { category });
};

export const editCategoryById = async (req, res, next) => {
  const { id } = req.params;
  const { name } = req.validated;

  const category = await CategoryRepositories.editCategory({ id, name });
  if (!category) {
    return next(new NotFoundError('Category tidak ditemukan'));
  }

  return response(res, 200, 'Category berhasil diperbarui', { category });
};

export const deleteCategoryById = async (req, res, next) => {
  const { id } = req.params;
  const deleted = await CategoryRepositories.deleteCategory(id);

  if (!deleted) {
    return next(new NotFoundError('Category tidak ditemukan'));
  }

  return response(res, 200, 'Category berhasil dihapus', { category: deleted });
};