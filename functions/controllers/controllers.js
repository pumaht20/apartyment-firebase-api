const admin = require("firebase-admin");

var serviceAccount = require("../apartyment-d511d-firebase-adminsdk-b1xm4-73e78aec59.json");
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://apartyment-d511d.firebaseio.com",
});
const db = admin.firestore();

exports.root = function (req, res) {
  return res.status(200).send("Hello World!");
};

exports.post_example = function (req, res) {
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
};
