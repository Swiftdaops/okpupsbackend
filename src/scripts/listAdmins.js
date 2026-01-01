import 'dotenv/config';
import mongoose from 'mongoose';
import { Admin } from '../models/Admin.model.js';

async function run() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error('MONGODB_URI not set in .env');
    process.exit(1);
  }

  try {
    await mongoose.connect(uri, { dbName: undefined });
    console.log('Connected to MongoDB');

    const admins = await Admin.find({}, { passwordHash: 0 }).lean();
    if (admins.length) {
      console.log('Admins found:');
      console.log(JSON.stringify(admins, null, 2));
    } else {
      console.log('No documents in `admins` collection. Checking `users` collection for role=admin...');
      const users = await mongoose.connection.db.collection('users').find({ role: 'admin' }).project({ passwordHash: 0, password: 0 }).toArray();
      if (users.length) {
        console.log('Admin users found in `users` collection:');
        console.log(JSON.stringify(users, null, 2));
      } else {
        console.log('No admin users found.');
      }
    }
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await mongoose.disconnect();
  }
}

run();
