import { createApp } from './app.js';
import { connectDb } from './config/db.js';
import { env } from './config/env.js';

await connectDb();

const app = createApp();

app.listen(env.PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`OKPUPS backend listening on :${env.PORT}`);
});
