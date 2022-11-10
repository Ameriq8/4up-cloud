import { Router, Response } from 'express';
import { CDNRequest } from '@root/types';
import convert from 'convert-pro';
import fileUpload from 'express-fileupload';
import mime from 'mime-types';
import * as database from '@utils/database';
import { Snowflake } from '@root/utils/snowflake';
import { isAuth } from '@v1/middlewares/authGuards';
import s3 from '@root/utils/aws.s3';
import path from 'path';
import { readFileSync, unlink } from 'fs';
import { deleteFileValidator, getFileValidator } from '../validators/cdn';
import prisma from '@root/utils/prisma';
import config from '@root/config';
import { Plan, PlansDetails } from '@root/constants';

const router = Router({ mergeParams: true });

router.use(
  fileUpload({
    preserveExtension: true,
    safeFileNames: true,
    abortOnLimit: true,
    useTempFiles: true,
    tempFileDir: path.resolve('tmp/'),
    uploadTimeout: 0,
  }),
);

router.get(
  '/:key',
  isAuth,
  getFileValidator,
  async (req: CDNRequest, res: Response): Promise<void | Response> => {
    try {
      const { key } = req.params;
      const file = await database.cdn.get({ key });
      if (!file) return res.status(404).json({ message: `${key} not found` });
      res.status(200).json(file);
    } catch (err) {
      return res.status(400).json({ message: err });
    }
  },
);

router.get(
  '/download/:key',
  getFileValidator,
  async (req: CDNRequest, res: Response): Promise<void | Response> => {
    try {
      const { key } = req.params;
      const file = await database.cdn.get({ key });
      if (!file) return res.status(404).json({ message: `${key} not found` });
      const url = s3.getSignedUrl('getObject', { Bucket: config.BUCKET_NAME, Key: key });
      res.set('Content-Type', mime.contentType(file.format));
      await prisma.file.update({
        where: {
          key,
        },
        data: {
          downloads: file.downloads++,
        },
      });
      res.redirect(302, url);
    } catch (err) {
      return res.status(400).json({ message: err });
    }
  },
);

router.post('/new', isAuth, async (req: CDNRequest, res: Response): Promise<void | Response> => {
  try {
    if (!req.files) return res.status(400).json({ error: 'No files provided' });

    let files = req.files['file'];
    if (!Array.isArray(files)) files = [files];

    const uploadedFiles: { file: string; url: string }[] = [];
    const unUploadedFiles: { file: string; details: string }[] = [];
    const userPlan: Plan = req.user.plan;
    const getBusinessPlan = await database.business.get({ userId: req.user.id });

    var userPlanDetails;

    if (userPlan == Plan.BUSINESS) {
      if (getBusinessPlan) userPlanDetails = getBusinessPlan;
      else userPlanDetails = PlansDetails[userPlan];
    } else userPlanDetails = PlansDetails[userPlan];

    if (userPlanDetails.gateaway.requests >= req.user.requests)
      return res
        .status(400)
        .json({
          message:
            "You cann't upload more files. You have reached the limit for this month in your plan",
        });

    for await (const file of files) {
      if (file.size > userPlanDetails.limitedPartSize) {
        unUploadedFiles.push({
          file: file.name,
          details:
            'Maximum file size is ' +
            convert.bytes(userPlanDetails.limitedPartSize, 'GB', { accuracy: 0, stringify: true }),
        });
        continue;
      }

      if (userPlanDetails.storageSpace < req.user.storage + file.size) {
        unUploadedFiles.push({
          file: file.name,
          details: "There isn't enough space to upload this file",
        });
        continue;
      }

      const fileExtension = path.extname(file.name);
      if (!fileExtension) return res.status(400).json({ error: 'Invalid file type' });

      const fileMimeTypeExtension = mime.extension(file.mimetype);
      if (!fileMimeTypeExtension) return res.status(400).json({ error: 'Invalid file mime type' });

      const key = Snowflake.generate() + fileExtension;
      const filePath = path.resolve(file.tempFilePath);

      await s3
        .upload({ Bucket: config.BUCKET_NAME, Key: key, Body: readFileSync(filePath) })
        .promise();

      unlink(filePath, (err) => {
        if (err) throw err;
      });

      await database.cdn.createFile({
        key: key,
        name: file.name,
        size: convert.bytes(file.size, { accuracy: 0, stringify: true }),
        format: fileExtension,
        downloads: 0,
        published: true,
        User: {
          connect: {
            id: req.user.id,
          },
        },
      });

      const url = s3.getSignedUrl('getObject', { Bucket: config.BUCKET_NAME, Key: key });
      uploadedFiles.push({ file: file.name, url });
    }

    res.status(201).json({ files: uploadedFiles, unUploadedFiles });
  } catch (err) {
    return res.status(400).json({ message: err });
  }
});

router.delete(
  '/',
  isAuth,
  deleteFileValidator,
  async (req: CDNRequest, res: Response): Promise<any> => {
    try {
      const { key } = req.body;
      const file = await database.cdn.get({ key });
      if (!file) return res.status(404).json({ message: `${key} not found` });
      prisma.file.update({
        where: {
          key,
        },
        data: {
          deleted: true,
        },
      });
      s3.deleteObject({ Bucket: config.BUCKET_NAME, Key: key }).promise();
      res.status(200).json({ message: `${key} has been deleted` });
    } catch (err) {
      return res.status(400).json({ message: err });
    }
  },
);

export default router;
