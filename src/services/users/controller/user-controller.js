import UserRepositories from '../repositories/user-repositories.js';
import response from '../../../utils/response.js';
import InvariantError from '../../../exceptions/invariant-error.js';
import NotFoundError from '../../../exceptions/not-found-error.js';

export const createUser = async (req, res, next) => {
  const { username, email, password, fullname } = req.validated;

  const isUsernameExist = await UserRepositories.verifyNewUsername(username);
  if (isUsernameExist) {
    return next(new InvariantError('Gagal menambahkan user. Username sudah digunakan.'));
  }

  const isEmailExist = await UserRepositories.verifyNewEmail(email);
  if (isEmailExist) {
    return next(new InvariantError('Gagal menambahkan user. Email sudah digunakan.'));
  }

  const user = await UserRepositories.createUser({ username, email, password, fullname });

  if (!user) {
    return next(new InvariantError('User gagal ditambahkan'));
  }

  return response(res, 201, 'User berhasil ditambahkan', { userId: user.id });
};

export const getUserById = async (req, res, next) => {
  const { id } = req.params;
  const user = await UserRepositories.getUserById(id);

  if (!user) {
    return next(new NotFoundError('User tidak ditemukan'));
  }

  return response(res, 200, 'User berhasil ditampilkan', { user });
};