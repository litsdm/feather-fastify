import File from '../../../../db/models/file';

const options = {
  schema: {
    querystring: {
      fileID: { type: 'string' },
      password: { type: 'string' }
    },
    response: {
      200: {
        type: 'object',
        properties: {
          isMatch: { type: 'boolean' }
        }
      }
    }
  }
};

const comparePassword = async ({ query }) => {
  const { fileID, password } = query;
  const file = await File.findOne({ _id: fileID });

  const isMatch = file.comparePassword(password);

  return { isMatch };
};

export default { options, handler: comparePassword };
