const mysql = require('mysql');
const { authenticate } = require('./_middleware/authenticate');

const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
  });
  
  const jwtSecret = process.env.JWT_SECRET;
  

export default function handler(req, res) {
  authenticate(req, res, () => {
    if (req.method === 'POST') {
      const entries = req.body;
      const username = req.user.username;

      entries.forEach(entry => {
        const { date, startTime, endTime, lunch, total } = entry;
        const query = 'INSERT INTO time_entries (Date, StartTime, EndTime, LunchTime, Total, username) VALUES (?, ?, ?, ?, ?, ?)';
        db.query(query, [date, startTime, endTime, lunch, total, username], (error, results) => {
          if (error) {
            console.error('Error adding entry:', error);
            return res.status(500).send(error);
          }
        });
      });

      res.send({ status: 'OK', message: 'Entries received' });
    } else {
      res.status(405).json({ message: 'Method Not Allowed' });
    }
  });
}
