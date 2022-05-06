import { createClient, Client } from 'edgedb';
import { config } from 'dotenv';

config();

export default async (cb: (options: { db: Client }) => void) => {
  const db = createClient();

  // TEMP: Test simple query
  const result = await db.query('select "Hello world";');
  console.log(result);

  cb({ db });
};
