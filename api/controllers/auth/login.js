const express=require('express')
const router=express.Router()
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
//insert data into the registration table
router.post('/register',(req,res)=>{

    const data=req.body
    db.query('INSERT INTO registration SET ?', data,(err,result)=>{
        if(err)
            res.send(err)
        else 
            // res.send(result)
         console.log('/register')
          res.redirect('/login')
        

    })
   
    
})
router.post('/login',(req,res)=>{

    const data=req.body
    db.query('select * from registration', data,(err,result)=>{
        if(err)
            res.send(err)
        else 
            // res.send(result)
         console.log('/register')
          res.redirect('/')
        

    })
})
app.post('/login', (req, res) => {
    const { username, password } = req.body;
  
    db.query('SELECT * FROM users WHERE username = ?', [username], (err, results) => {
      if (err) throw err;
  
      if (results.length > 0 && bcrypt.compareSync(password, results[0].password)) {
        req.session.loggedIn = true;
        req.session.username = username;
        res.redirect('/');
      } else {
        res.send('Incorrect username or password');
      }
    });
  });
  
  // Logout Route
  

module.exports=router