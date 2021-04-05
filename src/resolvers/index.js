import File from './file';
import Link from './link';
import FriendRequest from './friendRequest';
import User from './user';
import Feedback from './feedback';

export default {
  File: File.Main,
  Link: Link.Main,
  FriendRequest: FriendRequest.Main,
  User: User.Main,
  Feedback: { ...Feedback.Main },
  Query: {
    ...File.Query,
    ...Link.Query,
    ...FriendRequest.Query,
    ...Feedback.Query,
    ...User.Query
  },
  Mutation: {
    ...File.Mutation,
    ...Link.Mutation,
    ...FriendRequest.Mutation,
    ...Feedback.Mutation,
    ...User.Mutation
  },
  Subscription: {
    ...File.Subscription,
    ...Link.Subscription,
    ...FriendRequest.Subscription
  }
};
