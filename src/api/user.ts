import getUser from './actions/user/getUser';

import { withAuth } from '../middleware';

export default async fastify => {
  fastify.get('/', withAuth(getUser.options), getUser.handler);
};
