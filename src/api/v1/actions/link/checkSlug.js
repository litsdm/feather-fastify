import Link from '../../../../db/models/link';

const options = {
  schema: {
    querystring: {
      slug: { type: 'string' }
    },
    response: {
      200: {
        type: 'object',
        properties: {
          isValid: { type: 'boolean' }
        }
      }
    }
  }
};

const checkSlug = async ({ query }) => {
  const { slug } = query;

  const exists = await Link.findOne({ slug });
  const isValid = !exists;

  return { isValid };
};

export default { options, handler: checkSlug };
