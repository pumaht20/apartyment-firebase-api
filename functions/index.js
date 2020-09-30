//https://indepth.dev/building-an-api-with-firebase/ THE ARTICLE EXPLAINING ALL OF THIS.

const functions = require("firebase-functions");
const express = require("express");
const cors = require("cors");
const app = express();
const bodyParser = require("body-parser");
const routes = require("./routes/routes");

app.use(cors({ origin: true }));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

routes(app);

app.post("/api/post", (req, res) => {
  (async () => {
    try {
      await db
        .collection("items")
        .doc("/" + req.body.id + "/")
        .create({ item: req.body.item });
      return res.status(200).send();
    } catch (error) {
      console.log(error);
      return res.status(500).send(error);
    }
  })();
});

exports.app = functions.https.onRequest(app);
