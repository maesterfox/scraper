Puppeteer-based Web Scraping Application
This application allows users to input a URL, scrape all hyperlinks from the page, and then visit each URL to scrape specific data. It utilizes Puppeteer for web scraping and Express for a simple web server interface.

Features
Input URL through a simple web form.
Scrape all hyperlinks from the input URL.
Save hyperlinks to a JSON file, removing duplicates.
Visit each hyperlink to scrape specified data.
Save scraped data in a structured JSON document.
Basic error handling and logging for reliability.
Prerequisites
Before you begin, ensure you have installed the latest version of Node.js.

Installation
Clone the repository and install dependencies:

bash
Copy code
git clone <repository-url>
cd puppeteer-web-scraper
npm install
Usage
Start the server:

bash
Copy code
npm start
Navigate to http://localhost:3000 in your browser. Enter a URL in the form and submit to initiate the scraping process.

How It Works
User Interface: A simple web form accepts a URL from the user.
Fetching and Storing Links: Puppeteer navigates to the provided URL, scrapes all <a> tags, and saves the unique URLs into links.json.
Visiting URLs and Scraping Data: The application iterates over each URL from links.json, navigates to the page, and scrapes predefined data.
Data Storage: Scraped data is structured and saved into scrapedData.json.
Error Handling and Logging: Basic error handling is implemented for network issues and scraping errors, with logs for key events.
Configuring Scraped Data
To change the data scraped from each page, modify the scrapeData function in index.js. Adjust the Puppeteer page evaluation to scrape the desired content.

Contributing
Contributions are welcome! Please open an issue or submit a pull request with any improvements, bug fixes, or additional features.

License
This project is licensed under the MIT License - see the LICENSE file for details.

Customization
Remember to replace <repository-url> with the actual URL of your GitHub repository. Customize the Configuring Scraped Data section based on the specific implementation details of your scraping logic.

