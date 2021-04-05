import deleteFiles from './actions/dev/deleteUserFiles';
import createUserTextLinks from './actions/dev/createUserTextLinks';
import deleteFriend from './actions/dev/deleteFriend';
import addMissingFriends from './actions/dev/addMissingFriends';

export default async fastify => {
  fastify.get(
    '/createUserLinks',
    createUserTextLinks.options,
    createUserTextLinks.handler
  );

  fastify.put(
    '/addMissingFriends',
    addMissingFriends.options,
    addMissingFriends.handler
  );

  fastify.delete('/deleteFiles', deleteFiles.options, deleteFiles.handler);
  fastify.delete('/deleteFriend', deleteFriend.options, deleteFriend.handler);
};
