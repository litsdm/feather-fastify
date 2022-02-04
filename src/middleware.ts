/* eslint-disable import/prefer-default-export */
import TokenManager from './lib/tokenManager';

interface ExtraOptions {
  permissionLevel?: 'guest' | 'user' | 'admin';
}

const hasAccess = (permissionLevel: string, role: string) => {
  if (role === 'admin') return true;
  if (role === 'user' && permissionLevel !== 'admin') return true;
  if (role === permissionLevel) return true;

  return false;
};

const authPreHandler = async (request, reply, extraOptions: ExtraOptions) => {
  try {
    const { authorization } = request.headers;
    if (!authorization) throw new Error('Unauthorized: no token provided');

    const encryptedToken = authorization.substr(7);

    const payload = await TokenManager.verifyEncryptedToken(encryptedToken);

    if (
      extraOptions.permissionLevel &&
      !hasAccess(extraOptions.permissionLevel, payload.role)
    )
      throw new Error('You do not have permission to access this endpoint.');
  } catch (exception) {
    reply.code(401).send(exception);
  }
};

const combinedPreHandler =
  (optionsPreHandler, extraOptions: ExtraOptions) => async (request, reply) => {
    if (optionsPreHandler) await optionsPreHandler(request, reply);
    await authPreHandler(request, reply, extraOptions);
  };

export const withAuth = (options, extraOptions: ExtraOptions = {}) => ({
  ...options,
  preHandler: combinedPreHandler(options.preHandler, extraOptions)
});
