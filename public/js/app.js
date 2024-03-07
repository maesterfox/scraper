// 'root'/public/app.js:

document.addEventListener("DOMContentLoaded", function () {
  const form = document.getElementById("urlForm");
  const urlInput = document.getElementById("urlInput");
  const fileNameInput = document.getElementById("fileNameInput");
  const maxResultsInput = document.getElementById("maxResultsInput");
  const elementsToTargetInput = document.getElementById(
    "elementsToTargetInput"
  );
  const outputFormatInput = document.getElementById("outputFormatInput");
  const resultsDiv = document.getElementById("scrapingResults");
  const downloadButton = document.getElementById("downloadButton");
  downloadButton.disabled = true; // Disable the button initially

  const progressBarContainer = document.getElementById("progressBarContainer");
  progressBarContainer.classList.remove("d-none");
  let links; // Define the links variable outside the functions
  const socket = io("http://localhost:3006");

  form.addEventListener("submit", function (e) {
    console.log("Submitting form...");
    e.preventDefault(); // Prevent the default form submission
    resultsDiv.innerHTML = "<p>Scraping in progress...</p>";
    // Now including fileNameInput and outputFormatInput in the scrapeUrl call
    scrapeUrl(
      urlInput.value,
      fileNameInput.value,
      maxResultsInput.value,
      elementsToTargetInput.value,
      outputFormatInput.value
    );
    console.log(scrapeUrl);
  });

  async function scrapeUrl(
    url,
    fileName,
    maxResults,
    elementsToTarget,
    outputFormat
  ) {
    try {
      const bodyContent = {
        url,
        fileName,
        maxResults,
        elementsToTarget: elementsToTarget
          .split(",")
          .map((element) => element.trim()),
        outputFormat,
      };

      const initiateResponse = await fetch("/initiate-scrape", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bodyContent),
      });

      if (!initiateResponse.ok) {
        throw new Error(
          `Failed to initiate scrape: ${initiateResponse.statusText}`
        );
      }

      // Log the successful initiation
      const responseJson = await initiateResponse.json();
      console.log("Scrape initiated, jobId:", responseJson.jobId);

      // Here, instead of waiting for a "job done" event, enable the download button directly
      // assuming the successful response implies completion of scraping
      downloadButton.disabled = false; // Re-enable the download button

      // Optionally, call a function to update the UI or fetch and display results
      // displayResults(...) or similar logic here
    } catch (error) {
      console.error("Scraping error:", error);
      resultsDiv.innerHTML = `<p>Error during scraping: ${error.message}</p>`;
    }
  }

  // Listen for log messages from the server
  socket.on("log message", function (msg) {
    const logDiv = document.getElementById("log");
    logDiv.innerHTML += `<p>${msg}</p>`;
  });

  // Listen for job completion
  socket.on("job done", function (data) {
    // Assume `data` now contains the actual scraped data instead of just links
    scrapedData = data.scrapedData; // Adjust this according to the actual data structure
    displayResults(scrapedData);
    downloadButton.disabled = false; // Enable the download button after scraping is complete
  });

  function displayResults(scrapedData) {
    const resultsDiv = document.getElementById("scrapingResults"); // Ensure targeting the correct div
    if (scrapedData && scrapedData.length > 0) {
      let content = "<h2>Scraping completed. Results:</h2><ul>";
      scrapedData.forEach((dataItem) => {
        // Assuming dataItem is structured in a way that you want to display
        // You may need to adjust based on the actual structure of your scrapedData
        content += `<li>${dataItem.title || "N/A"}</li>`; // Example, using title as placeholder
      });
      content += "</ul>";
      resultsDiv.innerHTML = content;
    } else {
      resultsDiv.innerHTML = "<p>No results found.</p>";
    }
  }

  document
    .getElementById("downloadButton")
    .addEventListener("click", function () {
      // Retrieve user input for filename and format, providing defaults as fallbacks
      const fileNameValue =
        document.getElementById("fileNameInput").value.trim() || "scrapedData";
      const fileFormat =
        document
          .getElementById("outputFormatInput")
          .value.trim()
          .toLowerCase() || "json";

      // Create a new anchor element for downloading the file
      const a = document.createElement("a");
      a.href = "/download-scraped-data"; // This assumes your server is set up to serve the file from this route
      a.download = `${fileNameValue}.${fileFormat}`; // Sets the filename based on user input
      document.body.appendChild(a); // Temporarily add the anchor to the body
      a.click(); // Trigger the download
      document.body.removeChild(a); // Remove the anchor after triggering download
    });
});
