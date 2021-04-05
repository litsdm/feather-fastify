import _ from 'lodash';

import User from '../../../../db/models/user';

const options = {
  schema: {
    body: {
      type: 'object',
      properties: {
        userTag: { type: 'string' },
        friendTag: { type: 'string' }
      }
    }
  }
};

const deleteFriend = async ({ body }, reply) => {
  const { userTag, friendTag } = body;

  const user = await User.findOne({ tag: userTag }).exec();
  const friend = await User.findOne({ tag: friendTag }).exec();

  user.friends = _.filter(
    user.friends,
    element => element.toString() !== friend._id.toString()
  );
  friend.friends = _.filter(
    friend.friends,
    element => element.toString() !== user._id.toString()
  );

  await user.save();
  await friend.save();

  reply.send();
};

export default { options, handler: deleteFriend };
