const mongoose = require("mongoose");

const scrapedDataSchema = new mongoose.Schema({
  url: String,
  data: mongoose.Schema.Types.Mixed,
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("ScrapedData", scrapedDataSchema);
