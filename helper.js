const axios = require("axios");
const path = require("path");
const sizeOf = require("image-size");
const url = require("url");
const http = require("http");
const https = require("https");

module.exports = {
  getFileSize: async (url) => {
    try {
      const request = await axios.head(url);
      const contentLengthHeader = request.headers["content-length"];
      if (contentLengthHeader) {
        const fileSizeInBytes = parseInt(contentLengthHeader, 10);
        const fileSizeInKB = fileSizeInBytes / 1024; // Convert bytes to kilobytes
        return parseFloat(fileSizeInKB.toFixed(1));
      }
    } catch (error) {
      console.log(`Error in getting the filesize: ${error}`);
    }
  },
  getFileType: (url) => {
    const extension = path.extname(url);
    return extension.substring(1);
  },
  getFileDimension: (urlParam) => {
    const options = url.parse(urlParam);
    const client = options.protocol === "https:" ? https : http;
    return new Promise((resolve, reject) => {
      client.get(options, function (response) {
        const chunks = [];
        response
          .on("data", function (chunk) {
            chunks.push(chunk);
          })
          .on("end", function () {
            const buffer = Buffer.concat(chunks);
            resolve(sizeOf(buffer));
          })
          .on("error", (error) => {
            reject(error);
          });
      });
    });
  },
};
