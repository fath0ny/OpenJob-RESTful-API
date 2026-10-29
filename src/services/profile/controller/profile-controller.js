import UserRepositories from '../../users/repositories/user-repositories.js';
import ApplicationRepositories from '../../applications/repositories/application-repositories.js';
import BookmarkRepositories from '../../bookmarks/repositories/bookmark-repositories.js';
import response from '../../../utils/response.js';
import NotFoundError from '../../../exceptions/not-found-error.js';

export const getProfile = async (req, res, next) => {
  const { id } = req.user;
  const { data: user } = await UserRepositories.getUserById(id);

  if (!user) {
    return next(new NotFoundError('User tidak ditemukan'));
  }

  return response(res, 200, 'Profile berhasil ditampilkan', user);
};

export const getMyApplications = async (req, res) => {
  const { id: userId } = req.user;
  const applications = await ApplicationRepositories.getApplicationsByUserId(userId);
  return response(res, 200, 'Applications berhasil ditampilkan', { applications });
};

export const getMyBookmarks = async (req, res) => {
  const { id: userId } = req.user;
  const bookmarks = await BookmarkRepositories.getBookmarksByUser(userId);
  return response(res, 200, 'Bookmarks berhasil ditampilkan', { bookmarks });
};