const express = require('express');
const session = require('express-session');
const SQLiteStore = require('connect-sqlite3')(session);
const path = require('path');

const db = require('./db');

const app = express();

app.use(express.urlencoded({ extended: false }));
app.use(
  session({
    store: new SQLiteStore({ db: 'sessions.db', dir: path.join(__dirname) }),
    secret: 'secret-key',
    resave: false,
    saveUninitialized: false,
  })
);

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Expose user to templates
app.use((req, res, next) => {
  res.locals.user = req.session.user;
  next();
});

function ensureLoggedIn(req, res, next) {
  if (req.session.user) return next();
  res.redirect('/login');
}

function ensureRole(role) {
  return (req, res, next) => {
    if (req.session.user && req.session.user.role === role) return next();
    res.status(403).send('Forbidden');
  };
}

// Routes
const authRoutes = require('./routes/auth')(db);
const requisitionRoutes = require('./routes/requisition')(db, ensureLoggedIn, ensureRole);
const approvalRoutes = require('./routes/approval')(db, ensureLoggedIn);
const attendanceRoutes = require('./routes/attendance')(db, ensureLoggedIn);

app.use('/', authRoutes);
app.use('/', requisitionRoutes);
app.use('/', approvalRoutes);
app.use('/', attendanceRoutes);

app.get('/', (req, res) => res.redirect('/dashboard'));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
