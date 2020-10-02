const bcrypt = require("bcrypt");
const admin = require("firebase-admin");

const API_SALT_ROUNDS = 12;

var serviceAccount = require("../apartyment-d511d-firebase-adminsdk-b1xm4-73e78aec59.json");
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://apartyment-d511d.firebaseio.com",
});
const db = admin.firestore();

exports.root = function (req, res) {
  return res.status(200).send("Hello World!");
};

exports.register_user = async function (req, res) {
  const { email, name, password, phonenumber } = req.body;

  bcrypt.hash(password, API_SALT_ROUNDS, async function (err, hash) {
    try {
      const user = {
        email,
        name,
        hash,
        phonenumber,
      };
      const doc = await db.collection("user").add(user);
      res.status(201).send(`Created a new user: ${doc.id}`);
    } catch (error) {
      console.log("ERROR: ", error);
      res.status(400).send("Could not create user, please check information.");
    }
  });
};

exports.login_user = async function (req, res) {
  const { email, password } = req.body;
  let hashComparison = [{ password: "" }];
  let userData = {};
  try {
    const userCol = db.collection("user");
    const query = await userCol.where("email", "==", email).get();

    if (query.empty) {
      console.log("No matching documents(user) for this email.");
      return;
    }

    query.forEach((doc) => {
      //console.log(doc.id, "=>", doc.data());
      hashComparison = doc.data().hash;
    });
    console.log("hashComparison: ", hashComparison);
    bcrypt.compare(password, hashComparison, function (err, result) {
      //console.log("PASS: ", password, " HASHCOMP: ", hashComparison);
      //console.log("TRUE?: ", result);

      if (result) {
        query.forEach((doc) => {
          userData = {
            email: doc.data().email,
            name: doc.data().name,
            phonenumber: doc.data().phonenumber,
          };
        });
        res.status(200).json({ success: true, message: userData });
      } else {
        res.status(500).json({ success: false, message: "Wrong password." });
      }
    });
  } catch (error) {
    res.status(500).send(error);
  }
};
