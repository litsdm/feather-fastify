import deleteUsers from './actions/dev/deleteUsers';

export default async fastify => {
  fastify.delete('/deleteUsers', deleteUsers.options, deleteUsers.handler);
};
