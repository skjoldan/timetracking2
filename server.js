const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql');
const cors = require('cors');

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

app.post('/add-entry', function(req, res) {
  const entries = req.body;

  entries.forEach(entry => {
    const { date, startTime, endTime, lunch, total } = entry;

    if (total > 0) {
      const query = 'INSERT INTO time_entries (Date, StartTime, EndTime, LunchTime, Total) VALUES (?, ?, ?, ?, ?)';
      db.query(query, [date, startTime, endTime, lunch, total], function(error, results, fields) {
        if (error) throw error;
        console.log('Entry added successfully:', { date, startTime, endTime, lunch, total });
      });
    }
  });

  res.send({ status: 'OK', message: 'Entries received' });
});

app.get('/get-entries', function(req, res) {
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

app.listen(3000, () => {
  console.log('Server is running on port 3000');
});
