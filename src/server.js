// 'root'/src/server.js:

const cors = require("cors");
const express = require("express");
const helmet = require("helmet");
const app = express();
require("dotenv").config();
console.log(process.env.MONGO_URI); // This should print your MongoDB URI if loaded correctly
const path = require("path");
const validator = require("validator");
const rateLimit = require("express-rate-limit");
const morgan = require("morgan");
const http = require("http"); // Correctly require the http module
const { Server } = require("socket.io"); // Ensure socket.io's Server is correctly required
const connectDB = require("./db"); // Adjust the path according to your project structure
const { v4: uuidv4 } = require("uuid");
const ScrapedData = require("./models/ScrapedData"); // Adjust the path as necessary
const {
  fetchAndStoreLinks,
  scrapeData,
  setSocketInstance,
} = require("./scraper");

// Connect to MongoDB
connectDB();

// Create an HTTP server and bind the Express app to it
const server = http.createServer(app);
const io = new Server(server);

// Setup rate limiting to prevent abuse
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
});

// Assuming 'scraper.js' and 'scrapedData.json' are in the 'src' directory
app.use("/data", express.static(path.join(__dirname, "src")));

// Set port

const port = 3006;

// Middleware configurations
app.use(cors());
app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "../public")));
app.use(morgan("combined"));
app.use(limiter);

// Real-time communication setup with socket.io
io.on("connection", (socket) => {
  console.log("A user connected");
  socket.on("disconnect", () => {
    console.log("User disconnected");
  });
});

// Define emitLogMessage in server.js
const emitLogMessage = (msg) => {
  io.emit("log message", msg);
};

// Pass the io instance to scraper.js
setSocketInstance(io);

server.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});

const jobs = {}; // Tracks the status of scraping jobs

// Serve the homepage
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../public/index.html"));
});

// In your server.js or app.js file
app.get("/download-scraped-data", function (req, res) {
  const file = `${__dirname}/scrapedData.json`; // Adjust the path as necessary
  res.download(file); // Set the correct path to scrapedData.json
});

// Serve the scraper.js file
app.get("/scraper.js", (req, res) => {
  res.sendFile(path.join(__dirname, "./scraper.js"));
});

// Define logger function in server.js
const logger = (msg) => console.log(msg);

// Listen for form submission
app.post("/initiate-scrape", async (req, res) => {
  const { url } = req.body;
  const jobId = uuidv4(); // Generate a unique job ID

  try {
    // Emitting a log message to the client that scraping has started
    emitLogMessage(`Scraping initiated for URL: ${url}, Job ID: ${jobId}`);

    // Example scrape logic (adapt according to your actual scraping and saving logic)
    const links = await fetchAndStoreLinks(url); // Dummy function, replace with actual logic
    const data = await scrapeData(links, logger, io, emitLogMessage); // Pass emitLogMessage here

    // Simulate saving scraped data (replace with actual MongoDB saving logic)
    // Assuming you have a model called ScrapedData
    const newScrapedData = new ScrapedData({
      url,
      data, // This is the scraped data you wish to save
      jobId, // Storing jobId for reference
    });
    await newScrapedData.save();

    // Store the job status in an in-memory object or a more persistent storage as required
    jobs[jobId] = { status: "Completed", dataId: newScrapedData._id };

    // Emitting a log message to the client that scraping has completed
    emitLogMessage(`Scraping completed for URL: ${url}, Job ID: ${jobId}`);

    // Send back the job ID to the client
    res.json({ message: "Scrape initiated and data saved", jobId: jobId });
  } catch (error) {
    console.error("Scraping error:", error);
    res.status(500).json({
      error: "Failed to initiate scraping or save data",
      jobId: jobId,
    });
  }
});

// Cleanup function to remove old jobs
function cleanupJobs() {
  const expirationTime = 24 * 60 * 60 * 1000; // 24 hours
  const now = Date.now();
  Object.keys(jobs).forEach((jobId) => {
    if (now - parseInt(jobId) > expirationTime) {
      delete jobs[jobId];
    }
  });
}

// Schedule cleanup to run periodically
setInterval(cleanupJobs, 60 * 60 * 1000); // Every hour
