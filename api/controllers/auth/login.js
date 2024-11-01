const express=require('express')
const router=express.Router()
const mysql=require('mysql')
const dotenv=require('dotenv')


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

module.exports=router