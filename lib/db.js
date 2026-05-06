import { createClient } from '@libsql/client';
import { drizzle } from 'drizzle-orm/libsql';
import * as schema from './schema';

const databaseUrl = process.env.TURSO_DATABASE_URL;
const databaseAuthToken = process.env.TURSO_AUTH_TOKEN || undefined;

let databaseInstance;

const createDatabaseConfigurationError = () => {
  const error = new Error('TURSO_DATABASE_URL is not configured.');

  error.code = 'DB_NOT_CONFIGURED';

  return error;
};

const getDatabase = () => {
  if (!databaseUrl) {
    throw createDatabaseConfigurationError();
  }

  if (!databaseInstance) {
    const client = createClient({
      url: databaseUrl,
      authToken: databaseAuthToken,
    });

    databaseInstance = drizzle(client, { schema });
  }

  return databaseInstance;
};

export const isDatabaseConfigured = Boolean(databaseUrl);

export const db = new Proxy(
  {},
  {
    get(_target, property) {
      const instance = getDatabase();
      const value = Reflect.get(instance, property, instance);

      return typeof value === 'function' ? value.bind(instance) : value;
    },
  }
);
