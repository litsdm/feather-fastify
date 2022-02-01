/* eslint-disable import/prefer-default-export */
import TokenManager from './lib/tokenManager';

const authPreHandler = async (request, reply) => {
  try {
    const { authorization } = request.headers;
    if (!authorization) throw new Error('Unauthorized: no token provided');

    const encryptedToken = authorization.substr(7);

    await TokenManager.verifyEncryptedToken(encryptedToken);
  } catch (exception) {
    reply.code(401).send(exception);
  }
};

const combinedPreHandler = optionsPreHandler => async (request, reply) => {
  if (optionsPreHandler) await optionsPreHandler(request, reply);
  await authPreHandler(request, reply);
};

export const withAuth = options => ({
  ...options,
  preHandler: combinedPreHandler(options.preHandler)
});
