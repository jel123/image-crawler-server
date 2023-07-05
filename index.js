const axios = require("axios");
const cheerio = require("cheerio");
const express = require("express");
const cors = require("cors");
const https = require("https");
// helper
const helper = require("./helper");

const app = express();
const port = process.env.PORT || 3001;

app.use(express.json());
app.use(cors());

app.get("/api/data/:url", async (req, res) => {
  let crawledImages = [];
  const url = req.params?.url ? req.params.url : "";
  try {
    const selectRandom = () => {
      const userAgents = [
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64)  AppleWebKit/537.36 (KHTML, like Gecko) Chrome/74.0.3729.169 Safari/537.36",
        "Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/72.0.3626.121 Safari/537.36",
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/74.0.3729.157 Safari/537.36",
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/96.0.4664.110 Safari/537.36",
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/96.0.4664.45 Safari/537.36",
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/97.0.4692.71 Safari/537.36",
      ];
      var randomNumber = Math.floor(Math.random() * userAgents.length);
      return userAgents[randomNumber];
    };
    let user_agent = selectRandom();
    let header = {
      "User-Agent": `${user_agent}`,
    };

    const request = await axios.request({
      method: "get",
      url: url,
      timeout: 20000, //optional
      httpsAgent: new https.Agent({ keepAlive: true }),
      headers: header,
    });

    const html = request.data;
    const $ = cheerio.load(html);

    const imageDataPromises = $("img").map(async (idx, img) => {
      const src = $(img).attr("src");
      if (src) {
        return {
          url: src,
          fileSize: await helper.getFileSize(src),
          fileType: helper.getFileType(src),
          fileDimension: await helper.getFileDimension(src),
        };
      }
    });
    const imageData = await Promise.all(imageDataPromises);
    crawledImages.push(imageData);
    res.status(200).send(crawledImages);
  } catch (error) {
    console.log("THIS IS ERROR:", error);
    return res.status(400).send("error: " + error.toString());
  }
});

// app.get("/api/downloadImage/:url", async (req, res) => {
//   const url = req.params?.url ? req.params.url : "";
//   try {
//     const response = await axios({
//       method: 'GET',
//       url: url,
//       responseType: 'stream',
//     });

//     response.data.pipe(fs.createWriteStream('/tmp/image.jpg'));

//     return new Promise((resolve, reject) => {
//       response.data.on('end', () => {
//         resolve();
//       });

//       response.data.on('error', (err) => {
//         reject(err);
//       });
//     });
//   } catch (error) {
//     console.error('Error downloading image:', error);
//   }
// });

app.listen(port, () => {
  console.log(`listening to port ${port}`);
});
