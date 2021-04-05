import Link from '../../../../db/models/link';

const options = {
  schema: {
    response: {
      200: {
        type: 'object',
        properties: {
          slug: { type: 'string' }
        }
      }
    }
  }
};

const generateSlug = async () => {
  const promises = [];
  const slugs = [];
  let chosenSlug = '';

  for (let i = 0; i < 20; i += 1) {
    const slug = Math.random().toString(36).substr(2, 6).toLowerCase();
    slugs.push(slug);
    promises.push(Link.exists({ slug }));
  }

  const responses = await Promise.all(promises);

  responses.forEach((exists, index) => {
    if (!exists && !chosenSlug) {
      chosenSlug = slugs[index];
    }
  });

  if (!chosenSlug) throw new Error('Unable to generate Slug.');

  return { slug: chosenSlug };
};

export default { options, handler: generateSlug };
