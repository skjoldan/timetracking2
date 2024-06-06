const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(bodyParser.json());

const db = mysql.createConnection({
  host: 'mysql114.unoeuro.com',
  user: 'skjoldan_consulting_dk',
  password: '6crkyxw4RBb2',
  database: 'skjoldan_consulting_dk_db_timesheet'
});

db.connect((err) => {
  if (err) throw err;
  console.log('Connected to the database');
});



app.post('/add-entry', function(req, res) {
  const entries = req.body;

  entries.forEach(entry => {
      console.log(entry.date); // log date of each entry

      const { date, startTime, endTime, lunch, total } = entry;

      if (total > 0) { // check if total time for the day is calculated
          const query = 'INSERT INTO time_entries (Date, StartTime, EndTime, LunchTime) VALUES (?, ?, ?, ?)';
          db.query(query, [date, startTime, endTime, lunch], function(error, results, fields) {
              if (error) throw error;
              console.log('Entry added successfully');
          });
      }
  });

  res.send({status: 'OK', message: 'Entries received'});
});


console.log(db.query)

app.listen(3000, () => {
  console.log('Server is running on port 3000');
});
