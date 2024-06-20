const jwt = require('jsonwebtoken');

const jwtSecret = 'your_secret_key';

export function authenticate(req, res, next) {
  const token = req.headers.authorization.split(' ')[1];
  try {
    const decoded = jwt.verify(token, jwtSecret);
    req.user = decoded;
    next();
  } catch (e) {
    res.status(401).send({ message: 'Please authenticate' });
  }
}
