const mysql = require('mysql');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
  });
  
  const jwtSecret = process.env.JWT_SECRET;
  

const jwtSecret = 'your_secret_key';

export default function handler(req, res) {
  if (req.method === 'POST') {
    const { username, password } = req.body;

    const query = 'SELECT * FROM users WHERE username = ?';
    db.query(query, [username], async (error, results) => {
      if (error) {
        console.error('Error during login:', error);
        return res.status(500).send(error);
      }
      if (results.length === 0) {
        console.log('Invalid credentials for user:', username);
        return res.status(401).send({ message: 'Invalid credentials' });
      }

      const user = results[0];
      const passwordMatch = await bcrypt.compare(password, user.password);
      if (!passwordMatch) {
        console.log('Invalid credentials for user:', username);
        return res.status(401).send({ message: 'Invalid credentials' });
      }

      const token = jwt.sign({ username: user.username }, jwtSecret, { expiresIn: '1h' });
      console.log('Login successful for user:', username);
      res.send({ token });
    });
  } else {
    res.status(405).json({ message: 'Method Not Allowed' });
  }
}
