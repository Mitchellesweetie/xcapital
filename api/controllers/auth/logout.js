// const express = require('express');
// const mysql = require('mysql');
// const bcrypt = require('bcryptjs');
// const session = require('express-session');
// const bodyParser = require('body-parser');
// const path = require('path');

// const app = express();
// app.use(bodyParser.urlencoded({ extended: true }));
// app.use(session({
//   secret: 'secretkey',
//   resave: true,
//   saveUninitialized: true
// }));

// app.get('/logout', (req, res) => {
//     req.session.destroy(err => {
//       if (err) throw err;
//       res.redirect('/login');
//     });
//   });