export default {
  Main: {
    sender: async (parent, args, { models: { User } }) => {
      const sender = await User.findOne({ _id: parent.sender }).exec();
      return sender;
    }
  },
  Query: {
    allFeedback: async (parent, args, { models: { Feedback } }) => {
      const feedback = await Feedback.find().exec();
      return feedback;
    }
  },
  Mutation: {
    createFeedback: async (parent, args, { models: { Feedback } }) => {
      const newFeedback = new Feedback(args);

      try {
        await newFeedback.save();
      } catch (e) {
        console.error(e.message);
        throw new Error('Could not save Feedback.');
      }

      return newFeedback;
    }
  }
};
