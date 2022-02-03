import getUser from './actions/user/getUser';
import allUsers from './actions/user/allUsers';
import deleteUser from './actions/user/deleteUser';

import { withAuth } from '../middleware';

export default async fastify => {
  fastify.get('/', withAuth(getUser.options), getUser.handler);
  fastify.get('/all', withAuth(allUsers.options), allUsers.handler);

  fastify.delete('/', withAuth(deleteUser.options), deleteUser.handler);
};
