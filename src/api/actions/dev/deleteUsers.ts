const options = {};

const deleteUsers = async ({ db }, reply) => {
  await db.query('delete User');

  reply.send();
};

export default { options, handler: deleteUsers };
