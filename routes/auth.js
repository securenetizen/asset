const express = require('express');
const bcrypt = require('bcrypt');

module.exports = (db) => {
  const router = express.Router();

  router.get('/login', (req, res) => {
    res.render('login');
  });

  router.post('/login', (req, res) => {
    const { username, password } = req.body;
    db.get('SELECT * FROM users WHERE username = ?', [username], (err, user) => {
      if (!user || !bcrypt.compareSync(password, user.password)) {
        return res.render('login', { error: 'Invalid credentials' });
      }
      req.session.user = { id: user.id, username: user.username, role: user.role };
      res.redirect('/dashboard');
    });
  });

  router.post('/logout', (req, res) => {
    req.session.destroy(() => res.redirect('/login'));
  });

  return router;
};

