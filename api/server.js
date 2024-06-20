const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const path = require('path');

const app = express();

// CORS configuration
const corsOptions = {
  origin: 'https://timetracking-ux1q.onrender.com', // Your frontend URL
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
};

app.use(cors(corsOptions));

// Manually handle the OPTIONS preflight request to ensure proper headers are sent
app.options('*', cors(corsOptions));

app.use(bodyParser.json());

// Logging middleware to help debug
app.use((req, res, next) => {
  console.log(`Request Method: ${req.method}, Request URL: ${req.url}`);
  console.log('Request Headers:', req.headers);
  next();
});

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
app.get('/api/protected', authenticate, (req, res) => {
  res.send({ message: 'This is a protected route', user: req.user });
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

// Get Entries
app.get('/api/get-entries', authenticate, (req, res) => {
  console.log('Get entries request received:', req.query);
  const { year, month } = req.query;
  const monthString = month.toString().padStart(2, '0');
  const startDate = `${year}-${monthString}-01`;
  const endDate = `${year}-${monthString}-` + new Date(year, month, 0).getDate().toString().padStart(2, '0');
  const username = req.user.username;

  console.log('Date Range:', { startDate, endDate });

  const query = 'SELECT * FROM time_entries WHERE Date BETWEEN ? AND ? AND username = ?';
  console.log('Executing query:', query, 'with parameters:', [startDate, endDate, username]);

  db.query(query, [startDate, endDate, username], function(error, results, fields) {
    if (error) {
      console.error('Error during get-entries:', error);
      throw error;
    }
    const formattedResults = results.map(entry => ({
      ...entry,
      Date: entry.Date.toISOString().slice(0, 10)
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
