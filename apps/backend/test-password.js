const bcrypt = require('bcryptjs');

const password = 'demo123';
const hash = '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy';

bcrypt.compare(password, hash).then(result => {
  console.log('Password match:', result);
  if (!result) {
    bcrypt.hash(password, 10).then(newHash => {
      console.log('New hash for demo123:', newHash);
    });
  }
}).catch(err => {
  console.error('Error:', err);
});
