const express = require('express');
const jwt = require('jsonwebtoken');
const router = express.Router();
const db = require('../db');

const JWT_SECRET = process.env.JWT_SECRET || 'default_secret';

router.get('/majors', (req, res) => {
  db.all('SELECT * FROM majors', (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(rows);
  });
});

router.get('/majors/:id/routes', (req, res) => {
  const { id } = req.params;
  const { direction } = req.query;

  let query = 'SELECT * FROM routes WHERE major_id = ?';
  let params = [id];

  if (direction) {
    query += ' AND direction = ?';
    params.push(direction);
  }

  db.all(query, params, (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(rows);
  });
});

router.get('/majors/name/:name/routes', (req, res) => {
  const { name } = req.params;
  const { direction } = req.query;

  db.get('SELECT id FROM majors WHERE name = ?', [name], (err, major) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (!major) {
      return res.status(404).json({ error: '专业不存在' });
    }

    let query = 'SELECT * FROM routes WHERE major_id = ?';
    let params = [major.id];

    if (direction) {
      query += ' AND direction = ?';
      params.push(direction);
    }

    db.all(query, params, (err, rows) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json(rows);
    });
  });
});

router.post('/majors', (req, res) => {
  const { name, category, description } = req.body;

  if (!name) {
    return res.status(400).json({ error: '专业名称不能为空' });
  }

  db.run(
    'INSERT INTO majors (name, category, description) VALUES (?, ?, ?)',
    [name, category, description],
    function(err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.status(201).json({ id: this.lastID, name, category, description });
    }
  );
});

router.post('/routes', (req, res) => {
  const { major_id, direction, title, detail, requirement, salary, promotion } = req.body;

  if (!major_id || !direction || !title) {
    return res.status(400).json({ error: '缺少必要字段' });
  }

  db.run(
    'INSERT INTO routes (major_id, direction, title, detail, requirement, salary, promotion) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [major_id, direction, title, detail, requirement, salary, promotion],
    function(err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.status(201).json({ id: this.lastID, ...req.body });
    }
  );
});

router.get('/questions', (req, res) => {
  const { dimension, major_category, direction } = req.query;

  let query = 'SELECT * FROM questions';
  let params = [];

  if (dimension) {
    query += ' WHERE dimension = ?';
    params.push(dimension);
  }

  if (major_category && dimension) {
    query += ' AND major_category = ?';
    params.push(major_category);
  } else if (major_category) {
    query += ' WHERE major_category = ?';
    params.push(major_category);
  }

  if (direction && (dimension || major_category)) {
    query += ' AND direction = ?';
    params.push(direction);
  } else if (direction) {
    query += ' WHERE direction = ?';
    params.push(direction);
  }

  db.all(query, params, (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(rows);
  });
});

router.get('/questions/dimensions', (req, res) => {
  db.all('SELECT DISTINCT dimension FROM questions', (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(rows.map(row => row.dimension));
  });
});

router.get('/major-categories', (req, res) => {
  db.all('SELECT * FROM major_categories', (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(rows);
  });
});

router.get('/direction-weights', (req, res) => {
  db.all('SELECT * FROM direction_weights', (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(rows);
  });
});

router.get('/learning-plans', (req, res) => {
  const { direction, grade } = req.query;

  let query = 'SELECT * FROM learning_plans';
  let params = [];

  if (direction) {
    query += ' WHERE direction = ?';
    params.push(direction);
  }

  if (grade && direction) {
    query += ' AND grade = ?';
    params.push(grade);
  } else if (grade) {
    query += ' WHERE grade = ?';
    params.push(grade);
  }

  db.all(query, params, (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(rows.map(row => ({
      ...row,
      abilities: row.abilities ? JSON.parse(row.abilities) : [],
      phases: row.phases ? JSON.parse(row.phases) : []
    })));
  });
});

router.get('/major-skills', (req, res) => {
  const { major_name } = req.query;

  let query = 'SELECT * FROM major_skills';
  let params = [];

  if (major_name) {
    query += ' WHERE major_name = ?';
    params.push(major_name);
  }

  db.all(query, params, (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    const skillMap = {};
    rows.forEach(row => {
      if (!skillMap[row.major_name]) {
        skillMap[row.major_name] = {};
      }
      skillMap[row.major_name][row.direction] = row.skills ? JSON.parse(row.skills) : [];
    });
    res.json(skillMap);
  });
});

router.post('/test-records', (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ error: '未授权，请先登录' });
  }
  
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const userId = decoded.userId;
    
    const { major_name, grade, directions, scores, answers } = req.body;

    if (!major_name || !grade || !directions || !scores) {
      return res.status(400).json({ error: '缺少必要字段' });
    }

    db.run(
      'INSERT INTO test_records (user_id, major_name, grade, directions, scores) VALUES (?, ?, ?, ?, ?)',
      [userId, major_name, grade, JSON.stringify(directions), JSON.stringify(scores)],
      function(err) {
        if (err) {
          return res.status(500).json({ error: err.message });
        }

        const recordId = this.lastID;

        if (answers && Array.isArray(answers)) {
          answers.forEach(answer => {
            db.run(
              'INSERT INTO test_answers (record_id, question_id, answer_value) VALUES (?, ?, ?)',
              [recordId, answer.question_id, answer.value],
              (err) => {
                if (err) console.error('Error inserting answer:', err);
              }
            );
          });
        }

        res.status(201).json({ id: recordId });
      }
    );
  } catch (err) {
    return res.status(401).json({ error: '无效的token，请重新登录' });
  }
});

router.get('/test-records', (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ error: '未授权，请先登录' });
  }
  
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const userId = decoded.userId;
    
    db.all('SELECT * FROM test_records WHERE user_id = ? ORDER BY created_at DESC', [userId], (err, rows) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json(rows.map(row => ({
        ...row,
        directions: row.directions ? JSON.parse(row.directions) : [],
        scores: row.scores ? JSON.parse(row.scores) : {}
      })));
    });
  } catch (err) {
    return res.status(401).json({ error: '无效的token，请重新登录' });
  }
});

router.get('/test-records/:id', (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ error: '未授权，请先登录' });
  }
  
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const userId = decoded.userId;
    const { id } = req.params;

    db.get('SELECT * FROM test_records WHERE id = ? AND user_id = ?', [id, userId], (err, record) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      if (!record) {
        return res.status(404).json({ error: '记录不存在' });
      }

      db.all('SELECT * FROM test_answers WHERE record_id = ?', [id], (err, answers) => {
        if (err) {
          return res.status(500).json({ error: err.message });
        }
        res.json({
          ...record,
          directions: record.directions ? JSON.parse(record.directions) : [],
          scores: record.scores ? JSON.parse(record.scores) : {},
          answers: answers
        });
      });
    });
  } catch (err) {
    return res.status(401).json({ error: '无效的token，请重新登录' });
  }
});

router.get('/ability-benchmarks', (req, res) => {
  const { major_name, direction, grade } = req.query;

  let query = 'SELECT * FROM ability_benchmarks';
  let params = [];

  if (major_name) {
    query += ' WHERE major_name = ?';
    params.push(major_name);
  }

  if (direction && major_name) {
    query += ' AND direction = ?';
    params.push(direction);
  } else if (direction) {
    query += ' WHERE direction = ?';
    params.push(direction);
  }

  if (grade && (major_name || direction)) {
    query += ' AND grade = ?';
    params.push(grade);
  } else if (grade) {
    query += ' WHERE grade = ?';
    params.push(grade);
  }

  db.all(query, params, (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(rows.map(row => {
      let resources = [];
      if (row.learning_resources) {
        try {
          resources = JSON.parse(row.learning_resources);
        } catch (e) {
          resources = row.learning_resources.split(/[,，、]/).filter(s => s.trim()).map(s => s.trim());
        }
      }
      return {
        ...row,
        learning_resources: resources
      };
    }));
  });
});

router.post('/ability-assessments', (req, res) => {
  const { record_id, ability_name, current_level, target_level, gap_score, suggested_actions } = req.body;

  if (!record_id || !ability_name || current_level === undefined || target_level === undefined) {
    return res.status(400).json({ error: '缺少必要字段' });
  }

  db.run(
    'INSERT INTO ability_assessments (record_id, ability_name, current_level, target_level, gap_score, suggested_actions) VALUES (?, ?, ?, ?, ?, ?)',
    [record_id, ability_name, current_level, target_level, gap_score || 0, JSON.stringify(suggested_actions || [])],
    function(err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.status(201).json({ id: this.lastID });
    }
  );
});

router.get('/ability-assessments', (req, res) => {
  const { record_id } = req.query;

  let query = 'SELECT * FROM ability_assessments';
  let params = [];

  if (record_id) {
    query += ' WHERE record_id = ?';
    params.push(record_id);
  }

  db.all(query, params, (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(rows.map(row => ({
      ...row,
      suggested_actions: row.suggested_actions ? JSON.parse(row.suggested_actions) : []
    })));
  });
});

router.get('/question-versions', (req, res) => {
  db.all('SELECT * FROM question_versions', (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(rows);
  });
});

router.post('/question-versions', (req, res) => {
  const { version_name, description, is_active } = req.body;

  if (!version_name) {
    return res.status(400).json({ error: '版本名称不能为空' });
  }

  db.run(
    'INSERT INTO question_versions (version_name, description, is_active) VALUES (?, ?, ?)',
    [version_name, description || '', is_active || 0],
    function(err) {
      if (err) {
        if (err.message.includes('UNIQUE constraint failed')) {
          return res.status(400).json({ error: '版本名称已存在' });
        }
        return res.status(500).json({ error: err.message });
      }
      res.status(201).json({ id: this.lastID, version_name, description, is_active });
    }
  );
});

router.put('/question-versions/:id/activate', (req, res) => {
  const { id } = req.params;

  db.run('UPDATE question_versions SET is_active = 0', (err) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    db.run('UPDATE question_versions SET is_active = 1 WHERE id = ?', [id], function(err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      if (this.changes === 0) {
        return res.status(404).json({ error: '版本不存在' });
      }
      res.json({ message: '版本已激活' });
    });
  });
});

module.exports = router;
