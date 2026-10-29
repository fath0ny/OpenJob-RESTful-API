import fs from 'fs';
import ClientError from '../../../exceptions/client-error.js';
import NotFoundError from '../../../exceptions/not-found-error.js';
import response from '../../../utils/response.js';
import DocumentRepositories from '../repositories/document-repositories.js';

export const uploadDocument = async (req, res, next) => {
  if (!req.file) {
    return next(new ClientError('File is required'));
  }

  const { id: userId } = req.user;

  const document = await DocumentRepositories.createDocument({
    filename: req.file.filename,
    originalName: req.file.originalname,
    path: req.file.path,
    size: req.file.size,
    mimetype: req.file.mimetype,
    uploadedBy: userId,
  });

  if (!document) {
    return next(new ClientError('Dokumen gagal diunggah', 500));
  }

  return response(res, 201, 'Dokumen berhasil diunggah', {
    documentId: document.id,
    filename: document.filename,
    originalName: document.original_name,
    size: document.size,
  });
};

export const getDocuments = async (req, res) => {
  const documents = await DocumentRepositories.getDocuments();
  return response(res, 200, 'Documents berhasil ditampilkan', { documents });
};

export const getDocumentById = async (req, res, next) => {
  const { id } = req.params;
  const document = await DocumentRepositories.getDocumentById(id);

  if (!document || !fs.existsSync(document.path)) {
    return next(new NotFoundError('Dokumen tidak ditemukan'));
  }

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `inline; filename="${document.original_name}"`);
  return res.sendFile(document.path);
};

export const deleteDocumentById = async (req, res, next) => {
  const { id } = req.params;
  const document = await DocumentRepositories.getDocumentById(id);

  if (!document) {
    return next(new NotFoundError('Dokumen tidak ditemukan'));
  }

  await DocumentRepositories.deleteDocument(id);

  if (fs.existsSync(document.path)) {
    fs.unlinkSync(document.path);
  }

  return response(res, 200, 'Dokumen berhasil dihapus', { documentId: id });
};