const initSqlJs = require('sql.js');
const fs = require('fs');

async function testDb() {
  const SQL = await initSqlJs();
  const buffer = fs.readFileSync('./data/medical_diagnosis.db');
  const db = new SQL.Database(buffer);
  
  const users = db.exec('SELECT email, password_hash FROM users');
  console.log('Users in database:');
  console.log(JSON.stringify(users, null, 2));
  
  db.close();
}

testDb().catch(console.error);
