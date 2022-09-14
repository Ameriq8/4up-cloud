import S3 from 'aws-sdk/clients/s3';
import config from '@root/config';

const s3 = new S3({
  accessKeyId: config.AWS_S3.ACCESS_KEY_ID,
  secretAccessKey: config.AWS_S3.SECRET_ACCESS_KEY,
  endpoint: config.AWS_S3.ENDPOINT,
  s3ForcePathStyle: true,
  signatureVersion: 'v4',
  httpOptions: { timeout: 0 },
});

export default s3;

// (async () => {

//     const { Buckets } = await s3.listBuckets().promise();
//     const data = await s3.listObjects({ Bucket: "up.4meg.net" }).promise()
//     console.log(Buckets);
//     console.log(data)

//     // const params = {
//     //     Bucket: "up.4meg.net",
//     //     Key: "Screenshot.png"
//     //   }

//     //   const url = s3.getSignedUrl("getObject", params);
//     //   console.log(url)
//       // e.g. create an <img> where src points to url

// })();
