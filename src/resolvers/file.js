import { withFilter } from 'graphql-subscriptions';
import _ from 'lodash';
import dayjs from 'dayjs';
import IsSameOrAfter from 'dayjs/plugin/isSameOrAfter';

import encryptPassword from '../helpers/encryptPassword';

import { deleteFile } from '../api/v1/actions/s3/delete';

dayjs.extend(IsSameOrAfter);

const linkToLink = async (_id, slug, Link) => {
  const link = await Link.findOne({ slug });

  if (!link) return;

  link.files = [...link.files, _id];
  await link.save();
};

const deleteFileFromDB = async (_id, File) => {
  return File.findOneAndDelete({ _id }).exec();
};

const removeExpired = async (files, File) => {
  const dbPromises = [];
  const goodFiles = [];

  files.forEach(file => {
    const { expiresAt } = file;
    if (dayjs().isSameOrAfter(new Date(expiresAt))) {
      dbPromises.push(deleteFileFromDB(file._id, File));
    } else {
      goodFiles.push(file);
    }
  });

  await Promise.all(dbPromises);

  return goodFiles;
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
    files: async (parent, { userID, take, skip }, { models: { File } }) => {
      if (!userID) return null;
      const allFiles = await File.find(
        { to: userID },
        {},
        { sort: { createdAt: -1 } }
      )
        .limit(take || 20)
        .skip(skip || 0)
        .exec();

      const files = await removeExpired(allFiles, File);
      return files;
    },
    sentFiles: async (parent, { userID, take, skip }, { models: { File } }) => {
      if (!userID) return null;
      const allFiles = await File.find(
        {
          $and: [
            { from: userID },
            { to: { $ne: [] } },
            { to: { $ne: userID } }
            // { linkSlug: { $ne: '' } }
          ]
        },
        {},
        { sort: { createdAt: -1 } }
      )
        .limit(take || 20)
        .skip(skip || 0)
        .exec();
      const files = await removeExpired(allFiles, File);
      return files;
    }
  },
  Mutation: {
    createFile: async (parent, { body, extra }, context) => {
      const {
        models: { File, Link },
        pubsub
      } = context;
      const fileBody = JSON.parse(body);
      const newFile = new File(fileBody);

      const now = new Date();

      try {
        if (extra) {
          const { password, fileDuration, slug } = JSON.parse(extra);

          if (password) newFile.password = await encryptPassword(password);
          if (fileDuration && fileDuration > 0)
            newFile.expiresAt = now.setDate(now.getDate() + fileDuration);

          if (slug) await linkToLink(newFile._id, slug, Link);
        }

        if (!newFile.expiresAt)
          newFile.expiresAt = now.setDate(now.getDate() + 1);

        await newFile.save();
      } catch (exception) {
        console.log(exception.message);
        throw new Error('Could not create File');
      }

      pubsub.publish('FILE_CREATED', { createdFile: newFile });

      return newFile;
    },
    deleteFile: async (parent, { _id, userID }, context) => {
      const {
        models: { File },
        pubsub
      } = context;

      const file = await File.findOne({ _id }).exec();

      const index = _.findIndex(file.to, id => id.toString() === userID);
      if (index > -1) file.to.splice(index, 1);

      if (file.to.length === 0) {
        await File.findOneAndDelete({ _id }).exec();
        await deleteFile(file.s3Filename);
      } else await file.save();

      file.removedID = userID;
      pubsub.publish('FILE_DELETED', { deletedFile: file });

      return file;
    },
    updateFile: async (parent, { _id, properties, senderID }, context) => {
      const {
        models: { File },
        pubsub
      } = context;

      const file = await File.findOne({ _id }).exec();

      const parsedProperties = JSON.parse(properties);

      if (parsedProperties.currentPassword) {
        const isMatch = await file.comparePassword(
          parsedProperties.currentPassword
        );
        if (!isMatch) throw new Error('Current password is incorrect.');
      }

      if (parsedProperties.expiresAt) {
        if (file.remainingExpiryMods <= 0)
          throw new Error(
            'You have reached the limit of changes to the expiry date.'
          );
        // parsedProperties.expiresAt = new Date(parsedProperties.expiresAt);
        file.remainingExpiryMods -= 1;
      }

      Object.keys(parsedProperties).forEach(key => {
        if (file[key] !== undefined) {
          file[key] = parsedProperties[key];
        }
      });

      if (parsedProperties.password)
        file.password = await encryptPassword(parsedProperties.password);

      await file.save();

      if (senderID) updatedFile.senderID = senderID;
      pubsub.publish('FILE_UPDATED', { updatedFile: file });

      return file;
    }
  },
  Subscription: {
    createdFile: {
      subscribe: withFilter(
        (parent, args, { pubsub }) => pubsub.asyncIterator('FILE_CREATED'),
        (payload, { userID }) => {
          if (!payload) return false;

          if (
            payload.createdFile.to.length === 0 ||
            payload.createdFile.linkSlug !== ''
          )
            return false;

          return (
            payload.createdFile.to.includes(userID) ||
            payload.createdFile.from.toString() === userID
          );
        }
      )
    },
    deletedFile: {
      subscribe: withFilter(
        (parent, args, { pubsub }) => pubsub.asyncIterator('FILE_DELETED'),
        (payload, { userID }) => {
          if (!payload) return false;

          return payload.deletedFile.removedID === userID;
        }
      )
    },
    updatedFile: {
      subscribe: withFilter(
        (parent, args, { pubsub }) => pubsub.asyncIterator('FILE_UPDATED'),
        (payload, { userID }) => {
          if (!payload) return false;

          if (
            payload.createdFile.to.length === 0 ||
            payload.createdFile.linkSlug !== ''
          )
            return false;

          return (
            payload.updatedFile.to.includes(userID) ||
            payload.updatedFile.from.toString() === userID
          );
        }
      )
    }
  }
};
