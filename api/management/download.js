const express = require('express');
const pdf = require('html-pdf');
const puppeteer = require('puppeteer');
const path = require('path');

const router = express.Router();

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
    path.join(__dirname, 'views', 'yourPage.ejs'),
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