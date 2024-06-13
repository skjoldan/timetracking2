const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const path = require('path');

const app = express();
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
app.post('/api/register', async (req, res) => { // Note the `/api` prefix
  const { username, password } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);

  const query = 'INSERT INTO users (username, password) VALUES (?, ?)';
  db.query(query, [username, hashedPassword], (error, results) => {
    if (error) return res.status(500).send(error);
    res.send({ message: 'User registered successfully' });
  });
});

// User Login
app.post('/api/login', (req, res) => { // Note the `/api` prefix
  const { username, password } = req.body;

  const query = 'SELECT * FROM users WHERE username = ?';
  db.query(query, [username], async (error, results) => {
    if (error) return res.status(500).send(error);
    if (results.length === 0) return res.status(401).send({ message: 'Invalid credentials' });

    const user = results[0];
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) return res.status(401).send({ message: 'Invalid credentials' });

    const token = jwt.sign({ username: user.username }, jwtSecret, { expiresIn: '1h' });
    res.send({ token });
  });
});

// Middleware to protect routes
const authenticate = (req, res, next) => {
  const token = req.header('Authorization').replace('Bearer ', '');
  try {
    const decoded = jwt.verify(token, jwtSecret);
    req.user = decoded;
    next();
  } catch (e) {
    res.status(401).send({ message: 'Please authenticate' });
  }
};

// Example Protected Route
app.get('/api/protected', authenticate, (req, res) => { // Note the `/api` prefix
  res.send({ message: 'This is a protected route', user: req.user });
});

// Get Entries
app.get('/api/get-entries', authenticate, (req, res) => { // Note the `/api` prefix
  const { year, month } = req.query;
  const monthString = month.toString().padStart(2, '0'); // Ensure month is two digits
  const startDate = `${year}-${monthString}-01`;
  const endDate = `${year}-${monthString}-` + new Date(year, month, 0).getDate().toString().padStart(2, '0'); // Last day of the month

  console.log('Date Range:', { startDate, endDate });

  const query = 'SELECT * FROM time_entries WHERE Date BETWEEN ? AND ?';
  console.log('Executing query:', query, 'with parameters:', [startDate, endDate]);

  db.query(query, [startDate, endDate], function(error, results, fields) {
    if (error) throw error;
    const formattedResults = results.map(entry => ({
      ...entry,
      Date: entry.Date.toISOString().slice(0, 10) // Convert Date to 'YYYY-MM-DD'
    }));
    console.log('Retrieved entries:', formattedResults);
    res.send(formattedResults);
  });
});

// Serve the static files from the Vue.js app
app.use(express.static(path.join(__dirname, '../client/dist')));

// All other requests not handled will return the Vue app
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/dist/index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
