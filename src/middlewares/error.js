import multer from 'multer';
import response from '../utils/response.js';
import ClientError from '../exceptions/client-error.js';

const ErrorHandler = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    const message = err.code === 'LIMIT_FILE_SIZE'
      ? 'Ukuran berkas maksimal 5 MB'
      : err.message;
    return response(res, 400, message, null);
  }

  if (err instanceof ClientError) {
    return response(res, err.statusCode, err.message, null);
  }

  if (err.isJoi) {
    return response(res, 400, err.details[0].message, null);
  }

  const status = err.statusCode || err.status || 500;
  const message = err.message || 'Internal Server Error';

  console.error('Unhandled Error: ', err);
  return response(res, status, message, null);
};

export default ErrorHandler;