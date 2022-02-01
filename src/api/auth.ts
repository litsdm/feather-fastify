import signup from './actions/auth/signup';
import login from './actions/auth/login';
import refreshToken from './actions/auth/refreshToken';

export default async fastify => {
  fastify.get('/refreshToken', refreshToken.options, refreshToken.handler);

  fastify.post('/signup', signup.options, signup.handler);
  fastify.post('/login', login.options, login.handler);
};
