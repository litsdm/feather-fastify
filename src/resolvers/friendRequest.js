import { withFilter } from 'graphql-subscriptions';

const removeAsync = doc =>
  new Promise((resolve, reject) => {
    doc.remove(error => {
      if (error) reject(error);
      resolve();
    });
  });

const addFriendToUser = (model, userId, friendId) =>
  new Promise((resolve, reject) => {
    model
      .findOneAndUpdate({ _id: userId }, { $push: { friends: friendId } })
      .exec(error => {
        if (error) reject(error);
        resolve();
      });
  });

export default {
  Main: {
    from: async (parent, args, { models: { User } }) => {
      const user = await User.findOne({ _id: parent.from });
      return user;
    },
    to: async (parent, args, { models: { User } }) => {
      const user = await User.findOne({ _id: parent.to });
      return user;
    }
  },
  Query: {
    friendRequests: async (
      parent,
      { userID },
      { models: { FriendRequest } }
    ) => {
      const friendRequests = await FriendRequest.find({ to: userID }).exec();
      return friendRequests;
    }
  },
  Mutation: {
    createFriendRequest: async (parent, { tag, to, from }, context) => {
      const {
        models: { FriendRequest, User },
        pubsub
      } = context;
      let sendTo = to;

      if (tag) {
        const user = await User.findOne({ tag }).exec();
        sendTo = user._id;
      }

      const existingRequest = await FriendRequest.findOne({
        $or: [
          { from, to },
          { from: to, to: from }
        ]
      }).exec();

      if (existingRequest) throw new Error('Request already sent.');

      const newFriendRequest = new FriendRequest({ to: sendTo, from });

      try {
        await newFriendRequest.save();
      } catch (exception) {
        console.log(exception.message);
        throw new Error('Could not create friend requests.');
      }

      pubsub.publish('REQUEST_CREATED', { createdRequest: newFriendRequest });

      return newFriendRequest;
    },
    resolveFriendRequest: async (parent, { requestID, type }, context) => {
      const {
        models: { User, FriendRequest },
        pubsub
      } = context;
      const friendRequest = await FriendRequest.findOne({
        _id: requestID
      }).exec();
      const subscriptionID =
        type === 'accept' ? 'REQUEST_ACCEPTED' : 'REQUEST_REJECTED';
      const subscriptionProperty =
        type === 'accept' ? 'acceptedRequest' : 'rejectedRequest';

      if (type === 'accept') {
        const alreadyFriends = await User.findOne({
          _id: friendRequest.from,
          friends: friendRequest.to
        }).exec();

        if (alreadyFriends) throw new Error('You are already friends.');

        await addFriendToUser(User, friendRequest.to, friendRequest.from);
        await addFriendToUser(User, friendRequest.from, friendRequest.to);
      }

      await removeAsync(friendRequest);

      pubsub.publish(subscriptionID, { [subscriptionProperty]: friendRequest });

      return friendRequest;
    },
    befriendQR: async (parent, { userID, friendID }, context) => {
      const {
        models: { User, FriendRequest },
        pubsub
      } = context;

      const friend = await User.findOne({ _id: friendID }).exec();
      const friendRequest = await FriendRequest.findOne({
        $or: [
          { from: userID, to: friendID },
          { from: friendID, to: userID }
        ]
      }).exec();
      const usableFR = friendRequest || { from: userID, to: friendID };

      if (!friend) throw new Error('Invalid friend ID.');

      if (friend.friends.includes(userID)) throw new Error('Already friends.');

      if (friendRequest)
        await FriendRequest.findOneAndDelete({ _id: friendRequest._id }).exec();

      await addFriendToUser(User, userID, friendID);
      await addFriendToUser(User, friendID, userID);

      pubsub.publish('REQUEST_ACCEPTED', { friendRequest: usableFR });

      return friend;
    }
  },
  Subscription: {
    createdRequest: {
      subscribe: withFilter(
        (parent, args, { pubsub }) => pubsub.asyncIterator('REQUEST_CREATED'),
        (payload, { userID }) => {
          if (!payload) return false;

          return payload.createdRequest.to.toString() === userID;
        }
      )
    },
    acceptedRequest: {
      subscribe: withFilter(
        (parent, args, { pubsub }) => pubsub.asyncIterator('REQUEST_ACCEPTED'),
        (payload, { userID }) => {
          if (!payload) return false;

          return (
            payload.acceptedRequest.from.toString() === userID ||
            payload.acceptedRequest.to.toString() === userID
          );
        }
      )
    },
    rejectedRequest: {
      subscribe: withFilter(
        (parent, args, { pubsub }) => pubsub.asyncIterator('REQUEST_REJECTED'),
        (payload, { userID }) => {
          if (!payload) return false;

          return payload.rejectedRequest.to.toString() === userID;
        }
      )
    }
  }
};
