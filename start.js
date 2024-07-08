const { execSync } = require('child_process');
const path = require('path');

// Change to the api directory and start the server
execSync('node server.js', {
  cwd: path.resolve(__dirname, 'api'),
  stdio: 'inherit'
});
