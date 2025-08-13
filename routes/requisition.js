const express = require('express');

module.exports = (db, ensureLoggedIn, ensureRole) => {
  const router = express.Router();

  router.get('/dashboard', ensureLoggedIn, (req, res) => {
    db.all('SELECT * FROM assets', (err, assets) => {
      db.all(
        'SELECT r.id, a.name as asset, r.quantity, r.status, r.approval_level FROM requisitions r JOIN assets a ON r.asset_id = a.id WHERE r.user_id = ?',
        [req.session.user.id],
        (err2, reqs) => {
          res.render('dashboard', { assets, reqs });
        }
      );
    });
  });

  router.get('/inventory', ensureLoggedIn, (req, res) => {
    db.all('SELECT * FROM assets', (err, assets) => {
      res.render('inventory', { assets });
    });
  });

  router.post(
    '/inventory/add',
    ensureLoggedIn,
    ensureRole('admin'),
    (req, res) => {
      const { name, quantity } = req.body;
      db.run('INSERT INTO assets(name, quantity) VALUES (?,?)', [name, quantity], () => {
        res.redirect('/inventory');
      });
    }
  );

  router.post('/requisition', ensureLoggedIn, (req, res) => {
    const { asset_id, quantity } = req.body;
    db.run(
      'INSERT INTO requisitions(user_id, asset_id, quantity) VALUES (?,?,?)',
      [req.session.user.id, asset_id, quantity],
      () => {
        res.redirect('/dashboard');
      }
    );
  });

  router.get('/profile', ensureLoggedIn, (req, res) => {
    db.all(
      'SELECT a.name FROM allocations al JOIN assets a ON al.asset_id = a.id WHERE al.user_id = ?',
      [req.session.user.id],
      (err, allocations) => {
        res.render('profile', { allocations });
      }
    );
  });

  return router;
};

