export default {
  Query: {
    files: async (parent, args, { db }) => {
      console.log(db);
      return { id: 'sum' };
    }
  },
  Mutation: {
    createFile: async (parent, args, { db }) => {
      console.log(db);
      return { id: 'sum' };
    }
  }
};
