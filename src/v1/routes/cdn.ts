import { Router, Response } from 'express';
import { CDNRequest } from '@root/types';
import convertSize from 'convert-size';
import fileUpload from 'express-fileupload';
import * as database from '@utils/database';
import { Snowflake } from '@root/utils/snowflake';
import { isAuth } from '@v1/middlewares/authGuards';
import logger from '@root/utils/logger';
import s3 from '@root/utils/aws.s3';
import path from 'path';
import { unlink } from 'fs';

const router = Router({ mergeParams: true });

router.get('/', isAuth, async (req: CDNRequest, res: Response) => {
  const files = await database.cdn.getMany({ userId: req.user.id });
  res.status(200).send(files);
});

router.use(
  fileUpload({
    limits: { fileSize: 5e9 },
    preserveExtension: true,
    safeFileNames: true,
    abortOnLimit: true,
    useTempFiles: true,
    tempFileDir: path.resolve('tmp/'),
    uploadTimeout: 0,
  }),
);

router.post('/new', isAuth, async (req: CDNRequest, res: Response) => {
  if (req.params.file) return res.status(301).json({ error: 'Use /api/files for POST requests' });
  if (!req.files) return res.status(400).json({ error: 'No files provided' });

  let files = req.files['file'];
  // logger.debug(files['file'])
  if (!files) files = [files[Object.keys(files)[0]]];
  logger.debug(files);

  const uploadedFiles: { file: string; url: string }[] = [];
  const unuploadedFiles: { file: string; details: string }[] = [];

  for await (const file of files) {
    logger.debug('File Size is ' + file.size);
    if (file.size > 5e9)
      return unuploadedFiles.push({ file: file.name, details: 'Maximum file size is 5GB' });
    const fileExtension = path.extname(file.name);
    if (!fileExtension) return res.status(400).json({ error: 'Invalid file type' });

    const key = Snowflake.generate() + fileExtension;
    const filePath = path.resolve('tmp/' + key);

    const params = {
      Bucket: 'up.4meg.net',
      Key: key,
      Body: filePath,
    };

    await s3
      .upload(
        params,
        {
          partSize: 64 * 1024 * 1024,
        },
        (err) => {
          if (err) return res.status(400).json(err);
        },
      )
      .promise();

    unlink(filePath, (err) => {
      if (err)
        throw err;
    });

    await database.cdn.createFile({
      key: key,
      name: file.name,
      size: convertSize(file.size),
      format: fileExtension,
      downloads: 0,
      published: true,
      User: {
        connect: {
          id: req.user.id,
        },
      },
    });

    const url = s3.getSignedUrl('getObject', {
      Bucket: 'up.4meg.net',
      Key: key,
    });

    uploadedFiles.push({ file: key, url });
  }

  await res.status(201).json({ files: uploadedFiles });
});

export default router;
