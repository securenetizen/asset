const express = require('express');

module.exports = (db, ensureLoggedIn) => {
  const router = express.Router();

  router.get('/approvals', ensureLoggedIn, (req, res) => {
    let level;
    if (req.session.user.role === 'manager') level = 0;
    else if (req.session.user.role === 'admin') level = 1;
    else level = null;

    if (level === null) return res.render('approvals', { requisitions: [] });

    db.all(
      'SELECT r.id, u.username, a.name as asset, r.quantity, r.approval_level FROM requisitions r JOIN users u ON r.user_id = u.id JOIN assets a ON r.asset_id = a.id WHERE r.status = "pending" AND r.approval_level = ?',
      [level],
      (err, rows) => {
        res.render('approvals', { requisitions: rows });
      }
    );
  });

  router.post('/approvals/:id/approve', ensureLoggedIn, (req, res) => {
    const id = req.params.id;
    if (req.session.user.role === 'manager') {
      db.run('UPDATE requisitions SET approval_level = 1 WHERE id = ?', [id], () =>
        res.redirect('/approvals')
      );
    } else if (req.session.user.role === 'admin') {
      db.get('SELECT * FROM requisitions WHERE id = ?', [id], (err, reqRow) => {
        if (!reqRow) return res.redirect('/approvals');
        db.run('UPDATE requisitions SET status = "approved", approval_level = 2 WHERE id = ?', [id]);
        db.run('INSERT INTO allocations(user_id, asset_id) VALUES (?,?)', [
          reqRow.user_id,
          reqRow.asset_id,
        ]);
        db.run('UPDATE assets SET quantity = quantity - ? WHERE id = ?', [
          reqRow.quantity,
          reqRow.asset_id,
        ]);
        res.redirect('/approvals');
      });
    } else {
      res.status(403).send('Forbidden');
    }
  });

  return router;
};

