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
    start_time,
    end_time,
    description,
    creator_id,
    creator_name,
    creator_phone,
    creator_email,
  } = req.body;
  var start_time_date = new Date(start_time).toLocaleString("en-GB", {
    timeZone: "UTC",
  });
  var end_time_date = new Date(end_time).toLocaleString("en-GB", {
    timeZone: "UTC",
  });

  var time_diff =
    new Date(end_time).getHours() - new Date(start_time).getHours();
  const event_code = helpers.generate_event_code(5);
  try {
    const event = {
      title,
      start_time_date,
      end_time_date,
      time_diff,
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

exports.join_event = async function (req, res) {
  const {
    user_id,
    user_name,
    user_email,
    user_phonenumber,
    event_code,
  } = req.body;
  console.log("Event code: ", event_code);
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
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal server error." });
  }
};

exports.create_group = async function (req, res) {
  const {
    user_id,
    user_name,
    user_phonenumber,
    user_email,
    group_name,
    group_address,
    event_code,
  } = req.body;

  try {
    const user = { user_id, user_name, user_email, user_phonenumber };
    const group = { group_name, group_address };
    const station = { group_name, group_address, user_name, user_phonenumber };

    (await db.collection("group").add(group)).collection("members").add(user);

    //TODO: Validate that this exists first.
    db.collection("event").doc(event_code).collection("stations").add(station);
    db.collection("event").doc(event_code).collection("groups").add(group);

    res.status(200).json({
      success: true,
      message: `Group added to collection: ${group.group_name}`,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal server error." });
  }
};

exports.join_group = async function (req, res) {
  const {
    user_id,
    user_name,
    user_phonenumber,
    user_email,
    group_id,
  } = req.body;

  try {
    const groupCollection = db.collection("group").doc(group_id);

    groupCollection.get().then((doc) => {
      if (doc.exists) {
        const user = { user_id, user_name, user_email, user_phonenumber };
        db.collection("group").doc(group_id).collection("members").add(user);
        res.status(200).json({
          success: true,
          message: `User ${user.user_id} added to group ${doc.id}`,
        });
      } else {
        res
          .status(500)
          .json({ success: false, message: "This group does not exist." });
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

exports.generate_schedule = async function (req, res) {
  const { event_code } = req.body;
  var group_array = [];
  try {
    db.collection("event")
      .doc(event_code)
      .collection("groups")
      .get()
      .then(function (doc) {
        doc.docs.map((doc) => {
          group_array.push(doc.data().group_name);
        });

        if (group_array.length % 3 === 0) {
          //This is the amount of subdivisions, eg for 6 groups
          //we get 3 groups of 2, 2,2,2, these are group pairings regarding hosting
          //in the schedule, eg AB CD EF.
          var subdivision_count = group_array.length / 2;

          var subdivision_size = group_array.length / subdivision_count;

          //console.log("Subdivisions: ", subdivision_count);
          //console.log("Subdivision size: ", subdivision_size);
          var temparray;

          db.collection("event")
            .doc(event_code)
            .get()
            .then(function (doc) {
              //console.log("time_diff: ", doc.data().time_diff);
              //console.log(
              //"Total timespan in minutes: ",
              //doc.data().time_diff * 60,
              //"| Time per subdivision: ",
              //(doc.data().time_diff * 60) / subdivision_count,
              //" minutes."
              //);

              var subdivision_time =
                (doc.data().time_diff * 60) / subdivision_count;
              var ends = new Date(doc.data().start_time_date);
              var begins = new Date(doc.data().start_time_date);
              var counter = 0;
              for (
                i = 0, j = group_array.length;
                i < j;
                i += subdivision_size
              ) {
                //eg: [GROUP1, GROUP2], a timeslot.
                temparray = group_array.slice(i, i + subdivision_size);

                //Add time and subdivision to timeslot here.
                ends = addMinutes(ends, subdivision_time);

                var first_group = temparray[0];
                var second_group = temparray[1];

                if (counter !== 0) {
                  begins = addMinutes(begins, subdivision_time);
                }

                var time_slot = {
                  first_group,
                  second_group,
                  begins,
                  ends,
                };

                counter += 1;

                db.collection("event")
                  .doc(event_code)
                  .collection("schedule")
                  .add(time_slot);
              }
            });
        } else {
          console.log(group_array.length / 2);
        }
      });
  } catch (error) {
    console.log(error);
  }
};

function addMinutes(date, minutes) {
  return new Date(date.getTime() + minutes * 60000);
}

function shuffle(a) {
  var j, x, i;
  for (i = a.length - 1; i > 0; i--) {
    j = Math.floor(Math.random() * (i + 1));
    x = a[i];
    a[i] = a[j];
    a[j] = x;
  }
  return a;
}
