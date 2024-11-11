
const bcrypt=require('bcryptjs')
const mysql=require('mysql')
const dotenv=require('dotenv')

dotenv.config()
const db=mysql.createConnection({
    host: process.env.host,
    user: process.env.username,
    password: process.env.password,
    database: process.env.database

})
app.post('/register', (req, res) => {
    const { username, password } = req.body;
    const hashedPassword =  bcrypt.hashSync(password, 10);
  
    db.query('INSERT INTO users (username, password) VALUES (?, ?)', [username, hashedPassword], (err, result) => {
      if (err) {
        console.error(err);
        res.send('Error registering user');
      } else {
        res.redirect('/login');
      }
    });
  });