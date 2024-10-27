const express=require('express')
// const {Client}=require('pg')
const mysql=require('mysql')
const dotenv=require('dotenv')
// const bodyParser = require('body-parser')
const port=process.env.port
const path=require('path')
const cors=require('cors')
const blogs=require('./api/management/blogs')
const auth=require('./api/controllers/auth/auth')

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

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json())
app.use(express.urlencoded({extend:false}))

app.use('/api',blogs)

app.get('/', (req, res) => {
    res.render('index'); // Render the index.ejs file
})



app.get('/register', (req, res) => {
    res.render('register'); // Render the index.ejs file
})
app.get('/login', (req, res) => {
    res.render('login'); // Render the index.ejs file
})





// app.get('/form', (req, res) => {
//     res.sendFile(path.join(__dirname, 'public', 'form.html'));
// });
// app.get('/register', (req, res) => {
//     res.sendFile(path.join(__dirname, 'public', 'register.html'));
// });
// app.get('/login', (req, res) => {
//     res.sendFile(path.join(__dirname, 'public', 'login.html'));
// });
app.listen(process.env.port,()=>{
    console.log('listening at port  http://localhost:'+`${port}`)
})