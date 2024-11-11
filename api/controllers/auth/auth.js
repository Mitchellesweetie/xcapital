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
exports.register=(res,req)=>{

    const {username,email,password,confirmpassword}=req.body
    const hashedPassword = bcrypt.hashSync(password, 10);


    db.query('select email from registration where email=?',[email],(err,results)=>{
        if(err)
            res.send('Error querying the email from database')
        if(results.length>0)
            return res.render('register',{message:'Email has already been registered'})
        else if (password !== confirmpassword)
            return res.render('register',{message:'Passwords do not matching'})




            
    })

    res.send('form submitted')

}