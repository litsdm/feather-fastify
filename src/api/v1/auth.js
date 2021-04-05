import login from './actions/auth/login';
import signup from './actions/auth/singup';

export default async fastify => {
  fastify.post('/login', login.options, login.handler);
  fastify.post('/signup', signup.options, signup.handler);
};
