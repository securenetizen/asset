const express = require('express');

module.exports = (db, ensureLoggedIn) => {
  const router = express.Router();

  router.get('/attendance', ensureLoggedIn, (req, res) => {
    db.all(
      'SELECT timestamp FROM attendance WHERE user_id = ? ORDER BY timestamp DESC',
      [req.session.user.id],
      (err, rows) => {
        res.render('attendance', { records: rows });
      }
    );
  });

  router.post('/attendance/checkin', ensureLoggedIn, (req, res) => {
    db.run('INSERT INTO attendance(user_id) VALUES (?)', [req.session.user.id], () => {
      res.redirect('/attendance');
    });
  });

  return router;
};
