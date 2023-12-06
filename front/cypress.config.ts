import 'dotenv/config';
import { defineConfig } from 'cypress';
import { MongoClient } from 'mongodb';
import { saveSeedUser } from './cypress/utils/generateUser';
import * as fs from 'fs';

export default defineConfig({
  env: {
    API_URL: process.env.NEXT_PUBLIC_API_URL,
    TEST_KEY: process.env.TEST_KEY ?? 'test',
  },
  video: true,
  e2e: {
    baseUrl: 'http://localhost:3000',
    viewportHeight: 896,
    // viewportWidth: 896,
    viewportWidth: 414,
    experimentalRunAllSpecs: true,
    setupNodeEvents(on, config) {
      const client = new MongoClient(process.env.MONGO_URL ?? '');
      const db = client.db('GuHiw');
      client.connect();
      // implement node event listeners here
      on('task', {
        async resetDatabase() {
          try {
            await db.collection('User').deleteMany({});
            await db.collection('Chat').deleteMany({});
            await db.collection('Party').deleteMany({});
          } catch (e: any) {
            console.log(e);
          }

          return null;
        },
        saveUserJson() {
          if (!fs.existsSync('cypress/fixtures/users.json')) {
            saveSeedUser(12, 8);
          }
          return null;
        },
      });
    },
  },
});
