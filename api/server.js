const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const path = require('path'); // Import path module
require('dotenv').config({ path: path.resolve(__dirname, '.env') });

console.log('DB_HOST:', process.env.DB_HOST);
console.log('DB_PORT:', process.env.DB_PORT);
console.log('DB_USER:', process.env.DB_USER);
console.log('DB_NAME:', process.env.DB_NAME);

const authenticate = require('./_middleware/authenticate');

const app = express();

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin || /http:\/\/localhost:8080/.test(origin) || /https:\/\/.*\.vercel\.app$/.test(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  optionsSuccessStatus: 204
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

app.use(bodyParser.json());

const db = mysql.createConnection({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
});

db.connect((err) => {
  if (err) {
    console.error('Error connecting to the database:', err);
    console.error('Connection details:', {
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      user: process.env.DB_USER,
      database: process.env.DB_NAME
    });
    process.exit(1);
  }
  console.log('Connected to the database');
});

const jwtSecret = process.env.JWT_SECRET;

// User Registration
app.post('/api/register', async (req, res) => {
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
app.get('/api/protected', authenticate, (req, res) => {
  res.send({ message: 'This is a protected route', user: req.user });
});

// Get Entries
app.get('/api/get-entries', authenticate, (req, res) => {
  const { year, month } = req.query;
  const monthString = month.toString().padStart(2, '0');
  const startDate = `${year}-${monthString}-01`;
  const endDate = `${year}-${monthString}-` + new Date(year, month, 0).getDate().toString().padStart(2, '0');
  const username = req.user.username;

  console.log('Fetching entries for:', { startDate, endDate, username });

  const query = 'SELECT * FROM time_entries WHERE Date BETWEEN ? AND ? AND username = ?';
  db.query(query, [startDate, endDate, username], (error, results) => {
    if (error) {
      console.error('Error during get-entries:', error);
      return res.status(500).send(error);
    }
    const formattedResults = results.map(entry => ({
      ...entry,
      Date: entry.Date.toISOString().slice(0, 10)
    }));
    res.send(formattedResults);
  });
});

// Add Entries
app.post('/api/add-entry', authenticate, (req, res) => {
  const entries = req.body;
  const username = req.user.username;

  entries.forEach(entry => {
    console.log('Entry:', entry);
    const { date, startTime, endTime, lunch, total } = entry;
    const query = 'INSERT INTO time_entries (Date, StartTime, EndTime, LunchTime, Total, username) VALUES (?, ?, ?, ?, ?, ?)';
    db.query(query, [date, startTime, endTime, lunch, total, username], (error, results) => {
      if (error) {
        console.error('Error adding entry:', error);
        throw error;
      }
      console.log('Entry added successfully');
    });
  });

  res.send({ status: 'OK', message: 'Entries received' });
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
