const { exec } = require('child_process');
exec('ps aux | grep electron', (err, stdout) => {
  console.log(stdout);
});
