import dotenv from 'dotenv';

dotenv.config({
  path: __dirname + '/.env'
});

export const env = {
  PORT: process.env.PORT || 9797,
  DB_URL: process.env.DB_URL || '',
  SECRET: process.env.SECRET || '',

  SSL_KEY: process.env.SSL_KEY || '',
  SSL_CERT: process.env.SSL_CERT || '',

  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID || '',
  HUGGING_FACE_TOKEN: process.env.HUGGING_FACE_TOKEN || '',
};
