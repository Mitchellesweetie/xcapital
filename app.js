const express=require('express')
const bcrypt=require('bcryptjs')
const mysql=require('mysql')
const dotenv=require('dotenv')
const port=process.env.port
const path=require('path')
const cors=require('cors')
const flash = require('connect-flash')

dotenv.config()
const db=mysql.createConnection({
    host: process.env.host,
    user: process.env.username,
    password: process.env.password,
    database: process.env.database

})
db.connect((err)=>{
    if(!err){
        console.log('Connect')
    }
    
})
const app=express()
app.use(cors())
app.use(flash());
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json())//parse json bodies as sent by api clients
app.use(express.urlencoded({extend:false}))// parse url encoded bodies (as sent as HTML forms)



app.use('/api',require('./api/management/blogs'))
app.use('/auth',require('./api/management/auth'))

app.get('/', (req, res) => {
    res.render('index'); // Render the index.ejs file
})
app.get('/register', (req, res) => {
    res.render('register', { successMessage: null, errorMessage: null }); 
  });
app.get('/login', (req, res) => {
    res.render('login', { successMessage: null, errorMessage: null }); 
  });
app.get('/single',(req,res)=>{
    res.render('single')
})
app.get('/teacher',(req,res)=>{
    res.render('teacher')
})
app.get('/about',(req,res)=>{
    res.render('about')
})
app.get('/home',(req,res)=>{
    res.render('home')
})
app.get('/course',(req,res)=>{
    res.render('course')
})
app.get('/blog',(req,res)=>{

        db.query('SELECT * FROM form', (err, results) => {
            if (err) {
                console.error('Error fetching data:', err);
                return res.status(500).send('Database error');
            }
            const blogs=results.slice(0,2)
            const sidebarPosts = results.slice(2,6);

            // Render the EJS template with all the results
            res.render('blog', { blogs,sidebarPosts});
        });
    });
app.get('/apply',(req,res)=>{
    res.render('apply')
})



app.get('/form',(req,res)=>{
    res.render('form')
})


app.listen(process.env.port,()=>{
    console.log('listening at port  http://localhost:'+`${port}`)
})