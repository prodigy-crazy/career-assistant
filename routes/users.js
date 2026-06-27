const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const router = express.Router();
const db = require('../db');
const { generateCaptcha, storeCaptcha, validateCaptcha } = require('../captcha');

const JWT_SECRET = process.env.JWT_SECRET || 'default_secret';

function generateToken(userId) {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: '7d' });
}

router.get('/captcha', (req, res) => {
  const { username } = req.query;
  
  if (!username) {
    return res.status(400).json({ error: '用户名不能为空' });
  }
  
  const captcha = generateCaptcha(4);
  storeCaptcha(username, captcha);
  
  res.json({ 
    captcha, 
    message: '验证码已发送（模拟）' 
  });
});

router.post('/register', (req, res) => {
  const { username, password, captcha } = req.body;

  if (!username || !password || !captcha) {
    return res.status(400).json({ error: '用户名、密码和验证码不能为空' });
  }

  if (username.length < 3 || username.length > 20) {
    return res.status(400).json({ error: '用户名长度必须在3-20位之间' });
  }

  const captchaResult = validateCaptcha(username, captcha);
  if (!captchaResult.valid) {
    return res.status(400).json({ error: captchaResult.error });
  }

  const hashedPassword = bcrypt.hashSync(password, 8);

  db.run(
    'INSERT INTO users (username, password) VALUES (?, ?)',
    [username, hashedPassword],
    function(err) {
      if (err) {
        if (err.message.includes('UNIQUE')) {
          return res.status(409).json({ error: '该用户已注册' });
        }
        return res.status(500).json({ error: err.message });
      }
      const token = generateToken(this.lastID);
      res.status(201).json({ 
        id: this.lastID, 
        username,
        token 
      });
    }
  );
});

router.post('/login', (req, res) => {
  const { username, password, captcha } = req.body;

  if (!username || !password || !captcha) {
    return res.status(400).json({ error: '用户名、密码和验证码不能为空' });
  }

  const captchaResult = validateCaptcha(username, captcha);
  if (!captchaResult.valid) {
    return res.status(400).json({ error: captchaResult.error });
  }

  db.get('SELECT * FROM users WHERE username = ?', [username], (err, user) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (!user) {
      return res.status(401).json({ error: '该用户未注册，请先注册' });
    }

    const isValid = bcrypt.compareSync(password, user.password);
    if (!isValid) {
      return res.status(401).json({ error: '密码错误，请重试' });
    }

    const token = generateToken(user.id);
    res.json({ 
      id: user.id, 
      username: user.username, 
      token 
    });
  });
});

router.post('/assessments', (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ error: '未授权' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const { scores, major, directions, grade } = req.body;

    db.run(
      'INSERT INTO assessments (user_id, scores, major, directions, grade) VALUES (?, ?, ?, ?, ?)',
      [decoded.userId, JSON.stringify(scores), major, JSON.stringify(directions), grade],
      function(err) {
        if (err) {
          return res.status(500).json({ error: err.message });
        }
        res.status(201).json({ id: this.lastID, ...req.body });
      }
    );
  } catch (err) {
    return res.status(401).json({ error: '无效的token' });
  }
});

router.get('/assessments', (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ error: '未授权' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);

    db.all('SELECT * FROM assessments WHERE user_id = ? ORDER BY created_at DESC', [decoded.userId], (err, rows) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      const assessments = rows.map(row => ({
        ...row,
        scores: JSON.parse(row.scores),
        directions: JSON.parse(row.directions)
      }));
      res.json(assessments);
    });
  } catch (err) {
    return res.status(401).json({ error: '无效的token' });
  }
});

router.get('/assessments/:id', (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ error: '未授权' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const { id } = req.params;

    db.get('SELECT * FROM assessments WHERE id = ? AND user_id = ?', [id, decoded.userId], (err, row) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      if (!row) {
        return res.status(404).json({ error: '测评记录不存在' });
      }
      res.json({
        ...row,
        scores: JSON.parse(row.scores),
        directions: JSON.parse(row.directions)
      });
    });
  } catch (err) {
    return res.status(401).json({ error: '无效的token' });
  }
});

module.exports = router;
