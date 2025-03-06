
const express = require('express');
const router = express.Router();
const mysql = require('mysql');
const dotenv = require('dotenv');
const puppeteer = require('puppeteer');
const path=require('path')
const ejs=require('ejs')
const excelJS = require("exceljs");
const  XLSX=require('xlsx')
// const { type } = require('os');
// const fs = require('fs').promises;

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



router.get('/excel-download', (req, res) => {
    try {
        pool.query(`SELECT username, email, phone FROM registration WHERE role="admin" `, (error, results) => {
            if (error) {
                console.error("Database Error:", error);
                return res.status(500).send("Database query failed");
            }

            console.log("Data fetched:", results); // Debugging

            if (!results || results.length === 0) {
                return res.status(404).send("No data available for export.");
            }

            // Create workbook
            const workbook = XLSX.utils.book_new();
            
            // Convert data to worksheet
            const worksheet = XLSX.utils.json_to_sheet(results, {
                header: ["username", "email", "phone"], // Column names
                skipHeader: false
            });

            // Add worksheet to workbook
            XLSX.utils.book_append_sheet(workbook, worksheet, 'Admins');

            // Generate buffer
            const buffer = XLSX.write(workbook, { 
                type: 'buffer',
                bookType: 'xlsx'
            });

            // Set response headers
            res.setHeader('Content-Disposition', 'attachment; filename="data.xlsx"');
            res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');

            return res.send(buffer);
        });
    } catch (error) {
        console.error('Full error:', error);
        return res.status(500).send(`Error generating Excel file: ${error.message}`);
    }
});

module.exports=router

