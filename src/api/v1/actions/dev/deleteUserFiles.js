import aws from 'aws-sdk';

import File from '../../../../db/models/file';
import Link from '../../../../db/models/link';

const { S3_BUCKET } = process.env;

const deleteObject = (s3, s3Params) =>
  new Promise((resolve, reject) => {
    s3.deleteObject(s3Params, error => {
      if (error) reject(error);
      resolve();
    });
  });

const options = {
  schema: {
    querystring: {
      userID: { type: 'string' }
    }
  }
};

const deleteUserFiles = async ({ query }, reply) => {
  const { userID } = query;
  const s3 = new aws.S3();

  const files = await File.find({
    $or: [{ to: userID }, { from: userID }]
  }).exec();

  const links = await Link.find({ from: userID }).exec();

  files.forEach(({ _id, s3Filename }) => {
    const s3Params = {
      Bucket: S3_BUCKET,
      Key: `Files/${s3Filename}`
    };
    File.deleteOne({ _id }).exec();
    deleteObject(s3, s3Params);
  });

  links.forEach(({ _id }) => {
    Link.deleteOne({ _id }).exec();
  });

  reply.send();
};

export default { options, handler: deleteUserFiles };
