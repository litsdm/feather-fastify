import dayjs from 'dayjs';

import { File, ResolverContext } from '../../types';

export default {
  Query: {
    files: async (_parent, _args, { db, userID }) => {
      const files = await db.query(
        `
        select File {
          id,
          createdAt,
          updatedAt,
          expiresAt,
          name,
          size,
          url,
          hostFilename,
          fileType,
          senderDevice,
          remainingExpiryModifications,
          from: {
            id,
            email,
            username
          },
          to: {
            id,
            email,
            username
          }
        } filter .to = <uuid>$userID
      `,
        { userID }
      );
      return files;
    }
  },
  Mutation: {
    createFile: async (_parent, { body }, { db }: ResolverContext) => {
      const { expiry, ...rest } = JSON.parse(body);

      const now = new Date();
      const [quantity, unit] = expiry ? expiry.split(' ') : ['1', 'd'];

      const fileBody = {
        createdAt: now.toString(),
        updatedAt: now.toString(),
        expiresAt: dayjs().add(quantity, unit).toString(),
        ...rest
      };

      const file = await db.querySingle<File>(
        `
          with file := (insert File {
            createdAt := <str>$createdAt,
            updatedAt := <str>$updatedAt,
            expiresAt := <str>$expiresAt,
            name := <str>$name,
            size := <int64>$size,
            url := <str>$url,
            hostFilename := <str>$hostFilename,
            fileType := <str>$fileType,
            senderDevice := <str>$senderDevice,
            from := (select User filter .id = <uuid>$from),
            to := (select User filter .id in $to)
          })
          select file {
            id,
            createdAt,
            updatedAt,
            expiresAt,
            name,
            size,
            url,
            hostFilename,
            fileType,
            senderDevice,
            remainingExpiryModifications,
            from: {
              id,
              email,
              username
            },
            to: {
              id,
              email,
              username
            }
          }
        `,
        fileBody
      );

      if (!file) throw new Error('Error creating user.');

      return file;
    }
  }
};
