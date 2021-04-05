export default {
  Main: {
    friends: async (parent, args, { models: { User } }) => {
      const friends = await User.find(
        { _id: { $in: parent.friends } },
        {},
        { collation: { locale: 'en' }, sort: { username: 1 } }
      ).exec();
      return friends;
    },
    friendRequestCount: async (parent, args, { models: { FriendRequest } }) => {
      const count = FriendRequest.countDocuments({ to: parent._id }).exec();
      return count;
    }
  },
  Query: {
    user: async (parent, { userID }, { models: { User } }) => {
      if (!userID) return null;
      const user = await User.findOne({ _id: userID }).exec();
      return user;
    }
  },
  Mutation: {
    updateUser: async (parent, { _id, properties }, { models: { User } }) => {
      const user = await User.findOne({ _id }).exec();

      const parsedProperties = JSON.parse(properties);

      Object.keys(parsedProperties).forEach(key => {
        if (user[key] !== undefined) {
          user[key] = parsedProperties[key];
        }
      });

      await user.save();

      return user;
    }
  }
};
