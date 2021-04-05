import aws from 'aws-sdk';

const { S3_BUCKET } = process.env;

const getSignedUrl = (s3, s3Params) =>
  new Promise((resolve, reject) => {
    s3.getSignedUrl('getObject', s3Params, (error, data) => {
      if (error) reject(error);
      resolve(data);
    });
  });

const options = {
  schema: {
    querystring: {
      filename: { type: 'string' }
    },
    response: {
      200: {
        type: 'object',
        properties: {
          signedRequest: { type: 'string' }
        }
      }
    }
  }
};

const signGet = async ({ query }) => {
  const s3 = new aws.S3();
  const { filename } = query;
  const s3Params = {
    Bucket: S3_BUCKET,
    Key: `Files/${filename}`,
    Expires: 6000,
    ResponseContentDisposition: `attachment; filename=${filename}`
  };

  const signedRequest = await getSignedUrl(s3, s3Params);

  return { signedRequest };
};

export default { options, handler: signGet };
