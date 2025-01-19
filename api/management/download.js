const express = require('express');
const router = express.Router();
const mysql = require('mysql');
const dotenv = require('dotenv');
const puppeteer = require('puppeteer');
const path=require('path')
const ejs=require('ejs')


dotenv.config();
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


function isAuthenticated(req, res, next) {
    if (req.session && req.session.userId) {
        return next(); 
    }
    res.redirect('/login_blog'); 
}



//download
async function getPersonal(userId) {
  return new Promise((resolve, reject) => {
      pool.query(
          'SELECT * FROM personal_details WHERE user_id = ? ',
          [userId],
          (error, results) => {
              if (error) {
                  console.error('Database query error:', error);
                  return reject(error); // Reject promise on error
              }
              if (!results || results.length === 0) {
                  console.warn('No personal details found for userId:', userId);
                  return resolve(null); // Resolve with null if no results
              }
              resolve(results[0]); // Return the first result
          }
      );
  });
}


async function getSkills(userId) {
    return new Promise((resolve, reject) => {
        pool.query(
            'SELECT * FROM skills WHERE user_id = ? ',
            [userId],
            (error, results) => {
                if (error) reject(error);
                resolve(results[0]);            }
        );
    });
}

async function getAwards(userId) {
    return new Promise((resolve, reject) => {
        pool.query(
            'SELECT * FROM awards WHERE user_id = ?',
            [userId],
            (error, results) => {
                if (error) reject(error);
                resolve(results[0]);            }
        );
    });
}

async function getEducation(userId) {
    return new Promise((resolve, reject) => {
        pool.query(
            'SELECT * FROM education WHERE user_id = ? ORDER BY education.end DESC',
            [userId],
            (error, results) => {
                if (error) reject(error);
                resolve(results[0]);            }
        );
    });
}

async function getLanguages(userId) {
    return new Promise((resolve, reject) => {
        pool.query(
            'SELECT * FROM languages WHERE user_id = ?',
            [userId],
            (error, results) => {
                if (error) reject(error);
                resolve(results[0]);            }
        );
    });
}


async function getExperience(userId) {
    return new Promise((resolve, reject) => {
        pool.query(
            'SELECT * FROM experience WHERE user_id = ? ORDER BY end DESC',
            [userId],
            (error, results) => {
                if (error) reject(error);
                resolve(results[0]);            }
        );
    });
}

async function getReferences(userId) {
    return new Promise((resolve, reject) => {
        pool.query(
            'SELECT * FROM references WHERE user_id = ?',
            [userId],
            (error, results) => {
                if (error) reject(error);
                resolve(results[0]);            }
        );
    });
}




router.get('/download-cv', isAuthenticated, async (req, res) => {
    const userId = req.session.userId;
    if (!userId) {
        return res.redirect('/login_blog');
    }

    try {
        // Fetch user data
        const personal_details = await getPersonal(userId);
        const education = await getEducation(userId);
        const experience = await getExperience(userId);
        const references = await getReferences(userId);
        const skills = await getSkills(userId);
        const awards = await getAwards(userId);
        const languages = await getLanguages(userId);

        // Render EJS template
        const template = await ejs.renderFile(
            path.join(__dirname, 'views', 'portfolio', 'download.ejs'),
            {
                personal_details,
                education,
                experience,
                references,
                skills,
                awards,
                languages
            }
        );

        // Generate PDF using Puppeteer
        const browser = await puppeteer.launch();
        const page = await browser.newPage();
        await page.setContent(template);

        const pdf = await page.pdf({
            format: 'A4',
            printBackground: true,
            margin: {
                top: '20px',
                right: '20px',
                bottom: '20px',
                left: '20px'
            }
        });

        await browser.close();

        // Send PDF to client
        res.contentType('application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename=cv.pdf');
        res.send(pdf);
    } catch (error) {
        console.error('Error generating PDF:', error);
        res.status(500).send('Error generating PDF');
    }
});



router.get('/download-pdf', (req, res) => {
  const ejs = require('ejs');

  router.get('/download-pdf', async (req, res) => {
    try {
      const browser = await puppeteer.launch();
      const page = await browser.newPage();
  
      // Load the page you want to convert to PDF
      await page.goto('http://localhost:3000/your-page-route', {
        waitUntil: 'networkidle0', // Ensure the page fully loads
      });
  
      // Generate PDF
      const pdfBuffer = await page.pdf({
        format: 'A4',
        printBackground: true, // Include background styles
      });
  
      await browser.close();
  
      // Set response headers for PDF download
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'attachment; filename="download.pdf"');
  
      res.send(pdfBuffer);
    } catch (error) {
      console.error('Error generating PDF:', error);
      res.status(500).send('Error generating PDF');
    }
  });

  // Render your EJS page as HTML
  ejs.renderFile(
    path.join(__dirname, 'views', 'download.ejs'),
    { data: someData },
    (err, html) => {
      if (err) return res.status(500).send('Error rendering HTML.');

      // Convert HTML to PDF
      pdf.create(html, { format: 'A4' }).toBuffer((err, buffer) => {
        if (err) return res.status(500).send('Error generating PDF.');

        // Send PDF as a downloadable file
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename="download.pdf"');
        res.send(buffer);
      });
    }
  );
});

module.exports = router;