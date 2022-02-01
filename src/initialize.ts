import { createClient, Client } from 'edgedb';

// eslint-disable-next-line @typescript-eslint/no-var-requires
require('dotenv').config();

export default async (cb: (options: { db: Client }) => void) => {
  const db = createClient();
  cb({ db });
};
