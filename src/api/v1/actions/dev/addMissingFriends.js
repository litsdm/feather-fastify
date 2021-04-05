import User from '../../../../db/models/user';

const options = {
  schema: {
    body: {
      type: 'object',
      properties: {
        userTag: { type: 'string' }
      }
    }
  }
};

const addMissingFriends = async ({ body }, reply) => {
  const { userTag } = body;

  const user = await User.findOne({ tag: userTag });
  const friends = await User.find({ friends: user._id });
  const friendIDs = friends.map(({ _id }) => _id);

  user.friends = [...user.friends, ...friendIDs];

  await user.save();

  reply.send();
};

export default { options, handler: addMissingFriends };
