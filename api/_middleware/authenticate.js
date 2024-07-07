const jwt = require('jsonwebtoken');

const jwtSecret = process.env.JWT_SECRET;

function authenticate(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];
  console.log('Token:', token);  // Log the token for debugging
  if (!token) {
    return res.status(401).send({ message: 'Authentication token missing' });
  }
  try {
    const decoded = jwt.verify(token, jwtSecret);
    console.log('Decoded token:', decoded);  // Log the decoded token
    req.user = decoded;
    next();
  } catch (e) {
    console.error('Token verification failed:', e);  // Log the error
    res.status(401).send({ message: 'Please authenticate' });
  }
}

module.exports = authenticate;
