require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
mongoose.set('strictQuery', true);
const User = require('../models/User');
const saltRounds = 10;

const users = [
  {
    email: 'user1@example.com',
    password: 'user1Password',
    username: 'user1',
  },
  {
    email: 'user2@example.com',
    password: 'user2Password',
    username: 'user2',
  }
];

async function hashUserPasswords() {
  return Promise.all(
    users.map(async user => {
      const hashedPassword = await bcrypt.hash(user.password, saltRounds);
      return { ...user, hashedPassword };
    })
  );
}


mongoose.connect(process.env.MONGO_URL)
  .then(async x => {
    console.log(`Connected to ${x.connection.name}`);

    await User.deleteMany();
    const hashedUsers = await hashUserPasswords();
    const createdUsers = await User.create(hashedUsers); 
    return createdUsers;
  })
  .then(() => {
    console.log('Seed done 🌱');
  })
  .catch(e => console.log(e))
  .finally(() => {
    console.log('Closing connection');
    mongoose.connection.close();
  })

// Run npm run seed 