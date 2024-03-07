Project:
  Name: Web Scraping Application
  Description: A web application designed to scrape data from provided URLs, displaying real-time progress updates in the UI, and allowing users to download the results in JSON format.
  Technologies:
    Frontend:
      - HTML5
      - CSS3 (Bootstrap)
      - JavaScript (including Socket.IO for real-time updates)
    Backend:
      - Node.js
      - Express.js
      - Puppeteer for web scraping
      - MongoDB (using Mongoose for data modeling)
      - Socket.IO for real-time communication
  KeyIssues:
    - UI updates not reflecting in real-time
    - Download functionality for scraped results not working
    - Incorrect handling of parameters like 'Test 10' for limiting scraped URLs
