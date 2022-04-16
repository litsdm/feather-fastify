import { gql } from 'apollo-server-core';

export default gql`
  type Query {
    files: File
  }

  type Mutation {
    createFile: File
  }

  type User {
    id: ID!
    email: String
    username: String
    createdAt: String
    updatedAt: String
    lastConnection: String
    placeholderColor: String
    profilePic: String
    tag: String
    discriminator: String
    recentlySent: String
    isPro: Boolean
    role: String
    remainingTransfers: Int
  }

  type File {
    id: ID!
    createdAt: String
    updatedAt: String
    expiresAt: String
    name: String!
    size: Int!
    url: String
    hostFilename: String
    fileType: String
    senderDevice: String
    remainingExpiryModifications: Int
  }
`;
