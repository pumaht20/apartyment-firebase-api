const bcrypt = require("bcrypt");
const admin = require("firebase-admin");
const helpers = require("./helpers/helpers");
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
    const userCollection = db.collection("user");
    const query = await userCollection.where("email", "==", email).get();

    if (query.empty) {
      console.log("no matching documents(user) for this email.");
      return res
        .status(401)
        .json({ success: false, message: "email not found in database." });
    }

    query.forEach((doc) => {
      hashComparison = doc.data().hash;
    });
    bcrypt.compare(password, hashComparison, function (err, result) {
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

exports.create_event = async function (req, res) {
  const {
    title,
    date,
    time,
    description,
    creator_id,
    creator_name,
    creator_phone,
    creator_email,
  } = req.body;

  const event_code = generateEventCode(5);
  try {
    const event = {
      title,
      date,
      time,
      description,
      creator_id,
      creator_name,
      creator_phone,
      creator_email,
    };
    const eventCollection = await db
      .collection("event")
      .doc(event_code)
      .set(event);
    res.status(201).send(`Created a new event: ${event_code}`);
  } catch (error) {
    res.status(500).send(error);
  }
};

function generateEventCode(length) {
  var result = "";
  var characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  var charactersLength = characters.length;
  for (var i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

exports.join_event = async function (req, res) {
  const {
    user_id,
    user_name,
    user_email,
    user_phonenumber,
    event_code,
  } = req.body;
  console.log(event_code);
  try {
    const eventCollection = db.collection("event").doc(event_code);

    eventCollection.get().then((doc) => {
      if (doc.exists) {
        const user = { user_id, user_name, user_email, user_phonenumber };
        const attendeeCollection = db
          .collection("event")
          .doc(event_code)
          .collection("attendees")
          .add(user);
        res.status(200).json({
          success: true,
          message: `User added to event: ${user_name}`,
        });
      } else {
        res
          .status(401)
          .json({ success: false, message: "No event with that code exists." });
      }
      console.log("Exists? ", doc.exists);
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal server error." });
  }
};
