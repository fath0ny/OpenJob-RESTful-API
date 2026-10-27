import BookmarkRepositories from '../repositories/bookmark-repositories.js';
import response from '../../../utils/response.js';
import InvariantError from '../../../exceptions/invariant-error.js';
import NotFoundError from '../../../exceptions/not-found-error.js';

export const createBookmark = async (req, res, next) => {
  const { jobId } = req.params;
  const { id: userId } = req.user;

  const bookmark = await BookmarkRepositories.createBookmark({ jobId, userId });
  if (!bookmark) {
    return next(new InvariantError('Bookmark gagal ditambahkan'));
  }

  return response(res, 201, 'Bookmark berhasil ditambahkan', { bookmarkId: bookmark.id });
};

export const getBookmarkById = async (req, res, next) => {
  const { jobId, id } = req.params;
  const bookmark = await BookmarkRepositories.getBookmarkById(jobId, id);

  if (!bookmark) {
    return next(new NotFoundError('Bookmark tidak ditemukan'));
  }

  return response(res, 200, 'Bookmark berhasil ditampilkan', { bookmark });
};

export const getMyBookmarks = async (req, res) => {
  const { id: userId } = req.user;
  const bookmarks = await BookmarkRepositories.getBookmarksByUser(userId);
  return response(res, 200, 'Bookmarks berhasil ditampilkan', { bookmarks });
};

export const deleteBookmark = async (req, res, next) => {
  const { jobId } = req.params;
  const { id: userId } = req.user;

  const deleted = await BookmarkRepositories.deleteBookmarkByUserAndJob(jobId, userId);
  if (!deleted) {
    return next(new NotFoundError('Bookmark tidak ditemukan'));
  }

  return response(res, 200, 'Bookmark berhasil dihapus', { bookmark: deleted });
};