
const bcrypt=require('bcryptjs')
const mysql=require('mysql')
const dotenv=require('dotenv')

dotenv.config()
const pool = mysql.createPool({
    connectionLimit: 10, // Adjust based on your app's load
    host: process.env.host,
    user: process.env.username,
    password: process.env.password,
    database: process.env.database
  });
  
  pool.getConnection((err, connection) => {
    if (err) {
      console.error('Error getting connection:', err);
    } else {
        console.log('pool connection')
    }
  });
app.post('/register', (req, res) => {
    const { username, password } = req.body;
    const hashedPassword =  bcrypt.hashSync(password, 10);
  
    pool.query('INSERT INTO users (username, password) VALUES (?, ?)', [username, hashedPassword], (err, result) => {
      if (err) {
        console.error(err);
        res.send('Error registering user');
      } else {
        res.redirect('/login');
      }
    });
  });