import User from '../../../../db/models/user';

const options = {};

const createUserTextLinks = async (request, reply) => {
  await User.createIndexes({
    username: 'text',
    email: 'text'
  });

  reply.send();
};

export default { options, handler: createUserTextLinks };
