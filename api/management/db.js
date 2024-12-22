const mysql = require('mysql');

const db = mysql.createConnection({
    host: process.env.host,
    user: process.env.username,
    password: process.env.password,
    database: process.env.database
});

db.connect((err) => {
    if (!err) {
        console.log('Connected to the database');
    }
});