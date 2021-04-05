import aws from 'aws-sdk';
import { v4 as uuid } from 'uuid';

const { S3_BUCKET } = process.env;

const getSignedUrl = (s3, s3Params) =>
  new Promise((resolve, reject) => {
    s3.getSignedUrl('putObject', s3Params, (error, data) => {
      if (error) reject(error);
      resolve(data);
    });
  });

const options = {
  schema: {
    querystring: {
      filename: { type: 'string' },
      filetype: { type: 'string' },
      folder: { type: 'string' }
    },
    response: {
      200: {
        type: 'object',
        properties: {
          signedRequest: { type: 'string' },
          url: { type: 'string' },
          s3Filename: { type: 'string' }
        }
      }
    }
  }
};

const signPut = async ({ query }) => {
  const s3Options = {
    signatureVersion: 'v4',
    region: 'us-west-2',
    endpoint: new aws.Endpoint('feather-share.s3-accelerate.amazonaws.com'),
    useAccelerateEndpoint: true
  };
  const { filename, filetype, folder } = query;
  const s3 = new aws.S3(s3Options);
  const randomIndex = Math.floor(Math.random() * (4 - 0 + 1));
  const filenameParts = filename.split('.');

  filenameParts.splice(
    0,
    1,
    `${filenameParts[0]}-${uuid().split('-')[randomIndex]}`
  );

  const uniqueFilename = filenameParts.join('.');
  const s3Params = {
    Bucket: S3_BUCKET,
    Key: `${folder}/${uniqueFilename}`,
    Expires: 5 * 60,
    ContentType: filetype
    // ACL: 'public-read'
  };

  const signedRequest = await getSignedUrl(s3, s3Params);

  return {
    signedRequest,
    url: `https://${S3_BUCKET}.s3.amazonaws.com/${folder}/${uniqueFilename}`,
    s3Filename: uniqueFilename
  };
};

export default { options, handler: signPut };
