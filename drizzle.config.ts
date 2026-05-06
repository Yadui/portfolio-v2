import 'dotenv/config';

const config = {
  schema: './lib/schema.js',
  out: './drizzle',
  dialect: 'sqlite',
  dbCredentials: {
    url: process.env.TURSO_DATABASE_URL,
  },
};

export default config;
