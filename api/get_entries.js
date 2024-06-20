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
    if (req.method === 'GET') {
      const { year, month } = req.query;
      const monthString = month.toString().padStart(2, '0');
      const startDate = `${year}-${monthString}-01`;
      const endDate = `${year}-${monthString}-` + new Date(year, month, 0).getDate().toString().padStart(2, '0');
      const username = req.user.username;

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
    } else {
      res.status(405).json({ message: 'Method Not Allowed' });
    }
  });
}
