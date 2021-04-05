import { gql } from 'apollo-server-fastify';

export default gql`
  type Query {
    files(userID: String!, take: Int, skip: Int): [File]
    sentFiles(userID: String!, take: Int, skip: Int): [File]
    links(userID: String!, take: Int, skip: Int): [Link]
    link(linkID: String!): Link
    friendRequests(userID: String!): [FriendRequest]
    user(userID: String!): User
    allFeedback: [Feedback]
  }

  type Mutation {
    createFile(
      name: String!
      s3Url: String!
      s3Filename: String!
      to: [String]!
      from: String!
      type: String!
      size: Int!
      linkSlug: String
      extra: String
    ): File
    deleteFile(_id: String!, userID: String!): File
    updateFile(_id: String!, properties: String!): File
    createLink(
      from: String!
      to: [String]!
      emails: [String]
      slug: String!
      size: Int!
      options: String
      filenames: [String]
    ): Link
    updateLink(_id: String!, properties: String!): Link
    deleteLink(linkID: String!): DeleteResponse
    createFriendRequest(from: String!, to: String, tag: String): FriendRequest
    resolveFriendRequest(requestID: String!, type: String!): FriendRequest
    updateUser(_id: String!, properties: String!): User
    befriendQR(userID: String!, friendID: String!): User
    createFeedback(type: String!, message: String!, sender: String!): Feedback
  }

  type Subscription {
    createdFile(userID: String!): File
    deletedFile(userID: String!): File
    updatedFile(userID: String!): File
    createdLink(userID: String!): Link
    updatedLink(userID: String!): Link
    deletedLink(userID: String!): Link
    createdRequest(userID: String!): FriendRequest
    acceptedRequest(userID: String!): FriendRequest
    rejectedRequest(userID: String!): FriendRequest
  }

  type User {
    _id: ID!
    createdAt: String
    lastConnection: String
    email: String!
    username: String!
    placeholderColor: String!
    friends: [User]
    profilePic: String
    tag: String
    discriminator: String
    expoToken: String
    isPro: Boolean
    remainingBytes: Int
    remainingFiles: Int
    remainingTransfers: Int
    role: String
    recentlySent: [String]
    friendRequestCount: Int
  }

  type File {
    _id: ID!
    createdAt: String
    expiresAt: String
    updatedAt: String
    password: String
    name: String!
    s3Url: String!
    s3Filename: String!
    size: Int!
    from: User
    to: [User]
    senderDevice: String
    type: String
    isGroup: Boolean
    remainingExpiryMods: Int
  }

  type Link {
    _id: ID!
    createdAt: String
    updatedAt: String
    expiresAt: String
    type: String
    size: Int
    files: [File]
    from: User
    to: [String]
    slug: String
    fileCount: Int
  }

  type FriendRequest {
    _id: ID!
    createdAt: String
    updatedAt: String
    from: User
    to: User
  }

  type DeleteResponse {
    s3Filenames: [String]
    shouldDeleteS3: Boolean
  }

  type Feedback {
    _id: ID!
    createdOn: String
    sender: User
    type: String
    message: String
  }
`;
