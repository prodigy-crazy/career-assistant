const db = require('./db');

function generateCaptcha(length = 4) {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
  let captcha = '';
  for (let i = 0; i < length; i++) {
    captcha += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return captcha;
}

function storeCaptcha(key, captcha) {
  db.run('INSERT OR REPLACE INTO captchas (username, code, timestamp, attempts) VALUES (?, ?, ?, ?)',
    [key, captcha.toLowerCase(), Date.now(), 0],
    function(err) {
      if (err) console.error('Failed to store captcha:', err);
    });
}

function validateCaptcha(key, inputCode) {
  return new Promise((resolve) => {
    db.get('SELECT * FROM captchas WHERE username = ?', [key], (err, row) => {
      if (err) {
        return resolve({ valid: false, error: '数据库错误' });
      }
      if (!row) {
        return resolve({ valid: false, error: '验证码已过期，请重新获取' });
      }
      
      const now = Date.now();
      if (now - row.timestamp > 5 * 60 * 1000) {
        db.run('DELETE FROM captchas WHERE username = ?', [key]);
        return resolve({ valid: false, error: '验证码已过期，请重新获取' });
      }
      
      const newAttempts = row.attempts + 1;
      if (newAttempts > 3) {
        db.run('DELETE FROM captchas WHERE username = ?', [key]);
        return resolve({ valid: false, error: '验证次数过多，请重新获取' });
      }
      
      db.run('UPDATE captchas SET attempts = ? WHERE username = ?', [newAttempts, key]);
      
      if (inputCode.toLowerCase() !== row.code) {
        return resolve({ valid: false, error: '验证码错误' });
      }
      
      db.run('DELETE FROM captchas WHERE username = ?', [key]);
      return resolve({ valid: true });
    });
  });
}

module.exports = {
  generateCaptcha,
  storeCaptcha,
  validateCaptcha
};
