import User from '../../../../db/models/user';

const options = {
  schema: {
    querystring: {
      userID: { type: 'string' },
      searchText: { type: 'string' }
    }
  }
};

const searchUsers = async ({ query }) => {
  const { userID, searchText } = query;
  const users = await User.find(
    {
      $and: [
        { $text: { $search: searchText } },
        { friends: { $nin: [userID] } }
      ]
    },
    { score: { $meta: 'textScore' } }
  ).sort({ score: { $meta: 'textScore' } });

  return users;
};

export default { options, handler: searchUsers };
