import mongoose from 'mongoose';

require('dotenv').config();

const { FEATHER_ENV, DB_USER, DB_PWD } = process.env;

const getDBName = () => {
  switch (FEATHER_ENV) {
    case 'development':
      return 'tempo-dev';
    default:
      return 'tempo-prod';
  }
};

const DB_NAME = getDBName();
const MONGO_URL = `mongodb+srv://${DB_USER}:${DB_PWD}@cluster0.hb6tz.mongodb.net/${DB_NAME}?retryWrites=true&w=majority`;

export default cb => {
  const db = mongoose.connection;

  mongoose.connect(MONGO_URL, {
    useNewUrlParser: true,
    useFindAndModify: false,
    useCreateIndex: true,
    useUnifiedTopology: true
  });

  db.once('open', () => cb({ db }));
};
