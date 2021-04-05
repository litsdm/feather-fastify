import checkSlug from './actions/link/checkSlug';
import generateSlug from './actions/link/generateSlug';

export default async fastify => {
  fastify.get('/checkSlug', checkSlug.options, checkSlug.handler);
  fastify.get('/generateSlug', generateSlug.options, generateSlug.handler);
};
