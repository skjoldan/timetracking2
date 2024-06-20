const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const app = express();

// CORS configuration
app.use(cors());
app.use(bodyParser.json());

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

const jwtSecret = 'your_secret_key';

// User Registration
app.post('/api/register', async (req, res) => {
  console.log('Register request received:', req.body);
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
});

// User Login
app.post('/api/login', (req, res) => {
  console.log('Login request received:', req.body);
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
});

// Example Protected Route
app.get('/api/protected', (req, res) => {
  const token = req.header('Authorization').replace('Bearer ', '');
  try {
    const decoded = jwt.verify(token, jwtSecret);
    req.user = decoded;
    res.send({ message: 'This is a protected route', user: req.user });
  } catch (e) {
    res.status(401).send({ message: 'Please authenticate' });
  }
});

// Export the app as a serverless function
module.exports = app;
