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

exports.app = functions.https.onRequest(app);
