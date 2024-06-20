const mysql = require('mysql');
const bcrypt = require('bcrypt');

const db = mysql.createConnection({
  host: 'mysql9.unoeuro.com',
  user: 'flying_hippo_studio',
  password: 'D3EgzknAwp25bRxd4aBH',
  database: 'flying_hippo_studio_db_timesheet'
});

db.connect((err) => {
  if (err) throw err;
  console.log('Connected to the database');
});

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { username, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);

    const query = 'INSERT INTO users (username, password) VALUES (?, ?)';
    db.query(query, [username, hashedPassword], (error, results) => {
      if (error) {
        console.error('Error during registration:', error);
        return res.status(500).send(error);
      }
      res.send({ message: 'User registered successfully' });
    });
  } else {
    res.status(405).json({ message: 'Method Not Allowed' });
  }
}
