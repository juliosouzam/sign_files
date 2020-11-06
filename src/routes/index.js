const { resolve } = require('path');
const crypto = require('crypto');
const { readFile } = require('fs').promises;

const { Router } = require('express');
const multer = require('multer');

const File = require('../schemas/File');
const Sign = require('../schemas/Sign');

const multerConfig = require('../config/multer');

const routes = Router();
const upload = multer(multerConfig);

routes.get('/', (request, response) => {
  return response.json();
});

routes.get('/files', async (request, response) => {
  const files = await File.find();

  return response.json(files);
});

routes.post('/files', upload.array('files'), async (request, response) => {
  // TODO: store file info
  const { files } = request;

  const filesCreated = await Promise.all(
    files.map(async (file) => await File.create(file))
  );

  return response.json(filesCreated);
});

routes.get('/files/:file_id', async (request, response) => {
  const { file_id } = request.params;

  const file = await File.findById(file_id);

  return response.json(file);
});

routes.put('/files/:file_id', async (request, response) => {
  const { file_id } = request.params;

  const file = await File.findById(file_id);

  if (!file) {
    return response.status(400).json({ error: 'File not found!' });
  }

  if (file.signed) {
    return response.status(400).json({ error: 'File already signed!' });
  }

  const privateKey = await readFile(
    resolve(__dirname, '..', '..', 'keys', 'private.pem'),
    { encoding: 'utf-8' }
  );

  const doc = await readFile(
    resolve(__dirname, '..', '..', 'tmp', 'uploads', file.filename)
  );

  const signer = crypto.createSign('RSA-SHA512');
  signer.write(doc);
  signer.end();

  const signature = signer.sign(privateKey, 'base64');

  const sign = await Sign.create({ file, signature });

  await file.updateOne({ signed: true });

  return response.json({ sign, signer });
});

module.exports = routes;
