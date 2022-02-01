import signup from './actions/auth/signup';
import login from './actions/auth/login';

export default async fastify => {
  fastify.post('/signup', signup.options, signup.handler);
  fastify.post('/login', login.options, login.handler);
};
