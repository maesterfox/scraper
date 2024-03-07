// 'root'/src/scraper.js:

const puppeteer = require("puppeteer");
const fs = require("fs");

// Define handleError in server.js

async function handleError(error, context) {
  console.error(`Error in ${context}: ${error.message}`);
}

let ioInstance;

function setSocketInstance(io) {
  ioInstance = io;
}

// Fetch and store links from the given URL

async function fetchAndStoreLinks(url) {
  let browser;
  try {
    browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto(url, { waitUntil: "networkidle0" });
    const links = await page.$$eval("a", (as) => as.map((a) => a.href));
    const uniqueLinks = [...new Set(links)]; // Remove duplicates
    console.log(`[FetchAndStoreLinks] Fetched links: ${uniqueLinks.length}`);
    fs.writeFileSync("links.json", JSON.stringify(uniqueLinks, null, 2));
    return uniqueLinks;
  } catch (error) {
    handleError(error, "fetchAndStoreLinks");
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

async function scrapeData(links, logger, io, emitLogMessage) {
  let browser;
  try {
    browser = await puppeteer.launch();
    const scrapedData = [];
    for (let i = 0; i < links.length; i++) {
      let page;
      try {
        console.log(
          `[ScrapeData] Processing link ${i + 1}/${links.length}: ${links[i]}`
        );
        // Check if emitLogMessage is defined before using it
        if (emitLogMessage) {
          emitLogMessage(
            `Processing link ${i + 1}/${links.length}: ${links[i]}`
          );
        }

        page = await browser.newPage();
        await page.goto(links[i], { waitUntil: "networkidle2" });
        const data = await page.evaluate(() => {
          const title = document.title;
          const h1Text = document.querySelector("h1")?.innerText || "N/A";
          const paragraphs = [...document.querySelectorAll("p")]
            .map((p) => p.innerText)
            .filter((text) => text.trim() !== "")
            .join("\n\n");

          return { url: document.URL, title, h1: h1Text, paragraphs };
        });
        scrapedData.push(data);
      } catch (error) {
        handleError(error, `scrapeData (${links[i]})`);
        // It's also possible to use logger here for error logging
        logger(`Error in scrapeData (${links[i]}): ${error.message}`);
        scrapedData.push({ link: links[i], error: error.message });
      } finally {
        if (page) {
          await page.close();
        }
      }
    }
    fs.writeFileSync("scrapedData.json", JSON.stringify(scrapedData, null, 2));
    return scrapedData;
  } catch (error) {
    handleError(error, "scrapeData");
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

module.exports = { setSocketInstance, fetchAndStoreLinks, scrapeData };
