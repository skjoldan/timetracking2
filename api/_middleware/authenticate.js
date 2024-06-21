const jwt = require('jsonwebtoken');

const jwtSecret = process.env.JWT_SECRET;

function authenticate(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).send({ message: 'Authentication token missing' });
  }
  try {
    const decoded = jwt.verify(token, jwtSecret);
    req.user = decoded;
    next();
  } catch (e) {
    res.status(401).send({ message: 'Please authenticate' });
  }
}

module.exports = authenticate;
