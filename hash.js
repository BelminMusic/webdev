// hash.js
const bcrypt = require('bcrypt');

async function makeHash() {
  try {
    const password = '1234'; // change this to whatever password you want
    const saltRounds = 12;
    const hash = await bcrypt.hash(password, saltRounds);
    console.log('✅ Your new hash:\n', hash);
  } catch (err) {
    console.error('Error generating hash:', err);
  }
}

makeHash();
