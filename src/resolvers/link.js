import { withFilter } from 'graphql-subscriptions';
import dayjs from 'dayjs';

import encryptPassword from '../helpers/encryptPassword';

const deleteDocFromDB = async (_id, Model) => {
  return Model.findOneAndDelete({ _id }).exec();
};

const removeExpired = async (links, models) => {
  const { Link, File } = models;
  const dbPromises = [];
  const filePromises = [];
  const goodLinks = [];

  links.forEach(link => {
    const { expiresAt, files } = link;
    if (dayjs().isSameOrAfter(new Date(expiresAt))) {
      files.forEach(_id => filePromises.push(deleteDocFromDB(_id, File)));
      dbPromises.push(deleteDocFromDB(link._id, Link));
    } else {
      goodLinks.push(link);
    }
  });

  await Promise.all(filePromises);
  await Promise.all(dbPromises);

  return goodLinks;
};

export default {
  Main: {
    createdAt: async parent => {
      return parent.createdAt ? parent.createdAt.toString() : '';
    },
    updatedAt: async parent => {
      return parent.updatedAt ? parent.updatedAt.toString() : '';
    },
    expiresAt: async parent => {
      return parent.expiresAt ? parent.expiresAt.toString() : '';
    },
    fileCount: async parent => {
      return parent.files ? parent.files.length : 0;
    },
    files: async (parent, args, { models: { File } }) => {
      const files = await File.find({ _id: { $in: parent.files } }).exec();
      return files;
    },
    from: async (parent, args, { models: { User } }) => {
      const user = await User.findOne({ _id: parent.from }).exec();
      return user;
    },
    to: async (parent, args, { models: { User } }) => {
      const users = await User.find({ _id: { $in: parent.to } }).exec();
      return users;
    }
  },
  Query: {
    links: async (parent, { userID, take, skip }, { models }) => {
      const { Link } = models;
      if (!userID) return null;
      const allLinks = await Link.find(
        { $or: [{ from: userID }, { to: userID }] },
        {},
        { sort: { createdAt: -1 } }
      )
        .limit(take || 20)
        .skip(skip || 0)
        .exec();

      const links = await removeExpired(allLinks, models);
      return links;
    },
    link: async (parent, { linkID }, { models: { Link } }) => {
      const link = await Link.findOne({ _id: linkID }).exec();
      return link;
    }
  },
  Mutation: {
    createLink: async (parent, args, context) => {
      const {
        models: { Link, File },
        pubsub
      } = context;
      const { options, filenames, ...linkBody } = args;

      const fullFiles = await File.find({
        s3Filename: { $in: filenames }
      }).exec();
      const files = fullFiles.map(({ _id }) => _id);

      const newLink = new Link({ ...linkBody, files });

      const now = new Date();

      if (options) {
        const { password, fileDuration } = JSON.parse(options);

        if (password) newLink.password = await encryptPassword(password);
        if (fileDuration && fileDuration > 0)
          newLink.expiresAt = now.setDate(now.getDate() + fileDuration);
      }

      if (!newLink.expiresAt)
        newLink.expiresAt = now.setDate(now.getDate() + 1);

      try {
        await newLink.save();
      } catch (exception) {
        console.log(exception.message);
        throw new Error('Could not create link.');
      }

      pubsub.publish('LINK_CREATED', { createdLink: newLink });

      return newLink;
    },
    updateLink: async (parent, { _id, properties }, context) => {
      const {
        models: { Link },
        pubsub
      } = context;
      const link = await Link.findOne({ _id }).exec();

      const parsedProperties = JSON.parse(properties);

      Object.keys(parsedProperties).forEach(key => {
        if (link[key] !== undefined) {
          link[key] = parsedProperties[key];
        }
      });

      await link.save();

      pubsub.publish('LINK_UPDATED', { updatedLink: link });

      return link;
    },
    deleteLink: async (parent, { linkID }, context) => {
      const {
        models: { Link },
        pubsub
      } = context;

      const link = await Link.findOne({ _id: linkID })
        .populate('files', 's3Filename')
        .exec();
      const s3Filenames = link.files.map(({ s3Filename }) => s3Filename);

      await Link.findOneAndDelete({ _id: linkID }).exec();

      pubsub.publish('LINK_DELETED', { deletedLink: link });

      return { s3Filenames };
    }
  },
  Subscription: {
    createdLink: {
      subscribe: withFilter(
        (parent, args, { pubsub }) => pubsub.asyncIterator('LINK_CREATED'),
        (payload, { userID }) => {
          if (!payload) return false;

          // if (payload.createdLink.to.length === 0) return false;

          return (
            payload.createdLink.to.includes(userID) ||
            payload.createdLink.from.toString() === userID
          );
        }
      )
    },
    updatedLink: {
      subscribe: withFilter(
        (parent, args, { pubsub }) => pubsub.asyncIterator('LINK_CREATED'),
        (payload, { userID }) => {
          if (!payload) return false;

          return payload.updatedLink.from.toString() === userID;
        }
      )
    },
    deletedLink: {
      subscribe: withFilter(
        (parent, args, { pubsub }) => pubsub.asyncIterator('LINK_DELETED'),
        (payload, { userID }) => {
          if (!payload) return false;

          return payload.deletedLink.from.toString() === userID;
        }
      )
    }
  }
};
