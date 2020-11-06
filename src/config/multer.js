const { resolve, extname } = require('path');
const { v4: uuid } = require('uuid');
const multer = require('multer');

const tmpFolder = resolve(__dirname, '..', '..', 'tmp', 'uploads');

module.exports = {
  storage: multer.diskStorage({
    destination: tmpFolder,
    filename(_req, file, cb) {
      const fileName = `${uuid()}${extname(file.originalname)}`;

      return cb(null, fileName);
    },
  }),
};
