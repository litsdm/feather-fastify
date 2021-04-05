import aws from 'aws-sdk';

const { S3_BUCKET } = process.env;

const deleteObject = (s3, s3Params) =>
  new Promise((resolve, reject) => {
    s3.deleteObject(s3Params, error => {
      if (error) reject(error);
      resolve();
    });
  });

export const deleteFile = async filename => {
  const s3 = new aws.S3();
  const s3Params = {
    Bucket: S3_BUCKET,
    Key: `Files/${filename}`
  };

  await deleteObject(s3, s3Params);
};

const options = {
  schema: {
    body: {
      type: 'object',
      properties: {
        filename: { type: 'string' }
      }
    }
  }
};

const deleteS3 = async ({ body }, reply) => {
  const { filename } = body;

  await deleteFile(filename);

  reply.send();
};

export default { options, handler: deleteS3 };
