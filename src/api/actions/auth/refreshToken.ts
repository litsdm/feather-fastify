import TokenManager from '../../../lib/tokenManager';

const options = {
  schema: {
    200: {
      type: 'object',
      properties: {
        token: { type: 'string' }
      }
    }
  }
};

const refreshToken = async ({ headers }, reply) => {
  try {
    const encryptedToken = headers.authorization.substr(7);
    const { exp, iat, ...payload } = await TokenManager.verifyEncryptedToken(
      encryptedToken,
      true
    );

    console.log(payload);

    const token = TokenManager.generateAccessToken(payload);

    return { token };
  } catch (exception) {
    console.log(exception.message);
    reply.code(401).send(exception);
  }
};

export default { options, handler: refreshToken };
