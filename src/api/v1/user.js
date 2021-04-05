import search from './actions/user/search';

export default async fastify => {
  fastify.get('/search', search.options, search.handler);
};
