const bcrypt = require("bcrypt");
const admin = require("firebase-admin");
const helpers = require("./helpers/helpers");
const validators = require("./helpers/validators");
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

  try {
    const query = await db.collection("user").where("email", "==", email).get();

    if (query.empty) {
      let user_added = "";
      bcrypt.hash(password, API_SALT_ROUNDS, async (err, hash) => {
        if (err) {
          console.log(err.stack);
        } else {
          const user = {
            email,
            name,
            hash,
            phonenumber,
          };
          user_added = await db.collection("user").add(user);
        }
      });
      return res.status(201).json({
        success: true,
        message: `Created a new user: ${user_added}`,
      });
    } else {
      return res
        .status(409)
        .json({ success: false, message: "This email is already registered." });
    }
  } catch (error) {
    return res.status(500).send(error);
  }
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
        .status(404)
        .json({ success: false, message: "email not found in database." });
    }

    query.forEach((doc) => {
      hashComparison = doc.data().hash;
    });
    bcrypt.compare(password, hashComparison, function (err, result) {
      if (err) {
        console.log(err.stack);
      } else {
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
          res.status(401).json({ success: false, message: "Wrong password." });
        }
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
    return res.status(201).send(`Created a new event: ${event_code}`);
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
  try {
    const eventCollection = db.collection("event").doc(event_code);

    eventCollection
      .get()
      .then((doc) => {
        if (doc.exists) {
          const user = { user_id, user_name, user_email, user_phonenumber };
          const attendeeCollection = db
            .collection("event")
            .doc(event_code)
            .collection("attendees")
            .add(user);
          return res.status(200).json({
            success: true,
            message: `User added to event: ${user_name}`,
          });
        } else {
          throw new Error("Event does not exist");
        }
      })
      .catch((error) => {
        console.error(error);
        res.error(500);
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

    groupCollection
      .get()
      .then((doc) => {
        if (doc.exists) {
          const user = { user_id, user_name, user_email, user_phonenumber };
          db.collection("group").doc(group_id).collection("members").add(user);
          return res.status(200).json({
            success: true,
            message: `User ${user.user_id} added to group ${doc.id}`,
          });
        } else {
          throw new Error("This group does not exist");
        }
      })
      .catch((error) => {
        console.error(error);
        res.error(500);
      });
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

exports.join_group_in_event = async function (req, res) {
  const {
    user_id,
    user_name,
    user_phonenumber,
    user_email,
    event_code,
    group_id,
  } = req.body;

  try {
    const user = { user_id, user_name, user_email, user_phonenumber };
    db.collection("event")
      .doc(event_code)
      .collection("groups")
      .doc(group_id)
      .collection("members")
      .add(user);
    return res.status(200).json({
      success: true,
      message: `User ${user.user_id} added to members in group ${group_id}`,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

exports.generate_schedule = async function (req, res) {
  const { event_code } = req.body;
  var group_array = [];
  console.log(event_code);
  try {
    db.collection("event")
      .doc(event_code)
      .collection("groups")
      .get()
      .then(function (doc) {
        console.log("DOC: ", doc);
        //if (doc.exists) {
        doc.docs.map((doc) => {
          group_array.push(doc.data().group_name);
        });
        if (group_array.length % 3 === 0) {
          var subdivision_count = group_array.length / 3;
          var subdivision_size = group_array.length / 3;
          var temparray;
          var temparray2;

          db.collection("event")
            .doc(event_code)
            .get()
            .then(function (doc) {
              var subdivision_time =
                (doc.data().time_diff * 60) / subdivision_count;

              var ends = new Date(doc.data().start_time_date);
              var begins = new Date(doc.data().start_time_date);
              var counter = 0;
              var groups_object = [];
              for (var i = 0; i < group_array.length; i += subdivision_size) {
                temparray = group_array.slice(i, i + subdivision_size);
                var rest1 = group_array.slice(0, i);
                var rest2 = group_array.slice(
                  i + subdivision_size,
                  group_array.length
                );
                var rest = rest1.concat(rest2);

                var groups = [];
                for (var j = 0; j < rest.length; j += 2) {
                  temparray2 = rest.slice(j, j + 2);
                  groups.push(temparray2);
                }

                ends = helpers.add_minutes(ends, subdivision_time);

                if (counter !== 0) {
                  begins = helpers.add_minutes(begins, subdivision_time);
                }
                groups_counter = 0;
                for (var k = 0; k < temparray.length; k++) {
                  var host_group = temparray[k];
                  var attending_groups = groups[groups_counter];
                  var time_slot = {
                    host_group,
                    groups: attending_groups,
                    begins: begins.toLocaleString("en-GB", {
                      timeZone: "UTC",
                    }),

                    ends: ends.toLocaleString("en-GB", {
                      timeZone: "UTC",
                    }),
                  };
                  groups_object.push(time_slot);
                  groups_counter += 1;
                  db.collection("event")
                    .doc(event_code)
                    .collection("schedule")
                    .add(time_slot);
                }
                counter += 1;
              }
              return res
                .status(201)
                .json({ success: true, message: groups_object });
            })
            .catch((error) => {
              console.error(error);
              res.error(500);
            });
          return;
        } else {
          // In this case, we can't divide the entire array of groups into
          // smaller groups of 3, eg 7 groups: ["G1", "G2", "G3", "G4", "G5", "G6", "G7"]
          console.log("Now we are in shit fuck territory: ", group_array);
          console.log("length/2: ", group_array.length / 2);
          console.log("length/2 floored: ", Math.floor(group_array.length / 2));
          return res.status(200).json({ success: true, message: "fuck" });
        }
        //}
      })
      .catch((error) => {
        console.error(error);
      });
  } catch (error) {
    console.log(error);
  }
};

exports.get_event_information = async function (req, res) {
  const { event_code } = req.body;
  try {
    db.collection("event")
      .doc(event_code)
      .get()
      .then(function (doc) {
        return res.status(200).json({ success: true, message: doc.data() });
      })
      .catch((error) => {
        console.error(error);
        res.error(500);
      });
  } catch (error) {
    res.status(500).json({ success: false, message: error });
  }
};

exports.get_event_groups = async function (req, res) {
  const { event_code } = req.body;
  var group_array = [];
  try {
    db.collection("event")
      .doc(event_code)
      .collection("groups")
      .get()
      .then(function (doc) {
        doc.docs.map((doc) => {
          group_array.push(doc.data());
        });

        return res.status(200).json({ success: true, message: group_array });
      })
      .catch((error) => {
        console.error(error);
        res.error(500);
      });
  } catch (error) {
    res.status(500).json({ success: false, message: error });
  }
};

exports.get_event_schedule = async function (req, res) {
  const { event_code } = req.body;
  var schedule_array = [];
  try {
    db.collection("event")
      .doc(event_code)
      .collection("schedule")
      .get()
      .then(function (doc) {
        doc.docs.map((doc) => {
          schedule_array.push(doc.data());
        });

        return res.status(200).json({ success: true, message: schedule_array });
      })
      .catch((error) => {
        console.error(error);
        res.error(500);
      });
  } catch (error) {
    res.status(500).json({ success: false, message: error });
  }
};

exports.get_event_stations = async function (req, res) {
  const { event_code } = req.body;
  var stations_array = [];
  try {
    db.collection("event")
      .doc(event_code)
      .collection("stations")
      .get()
      .then(function (doc) {
        doc.docs.map((doc) => {
          stations_array.push(doc.data());
        });

        return res.status(200).json({ success: true, message: stations_array });
      })
      .catch((error) => {
        console.error(error);
        res.error(500);
      });
  } catch (error) {
    res.status(500).json({ success: false, message: error });
  }
};

exports.get_users = async function (req, res) {
  const user_array = [];
  try {
    db.collection("user")
      .get()
      .then(function (doc) {
        doc.docs.map((doc) => {
          user_array.push(doc.data());
        });
        return res.status(200).json({ success: true, message: user_array });
      })
      .catch((error) => {
        console.error(error);
        res.error(500);
      });
  } catch (error) {
    res.status(500).json({ success: false, message: error });
  }
};

exports.get_groups = async function (req, res) {
  const group_array = [];
  try {
    db.collection("group")
      .get()
      .then(function (doc) {
        doc.docs.map((doc) => {
          group_array.push(doc.data());
        });
        return res.status(200).json({ success: true, message: group_array });
      })
      .catch((error) => {
        console.error(error);
        res.error(500);
      });
  } catch (error) {
    res.status(500).json({ success: false, message: error });
  }
};
