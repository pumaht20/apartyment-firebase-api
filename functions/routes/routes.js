const controllers = require("../controllers/controllers");

module.exports = function (app) {
  //Root GETTER, returns "Hello World!".
  app.route("/root").get(controllers.root);
  //Register user.
  app.route("/register_user").post(controllers.register_user);
  //Login user.
  app.route("/login_user").post(controllers.login_user);
  //Create event.
  app.route("/create_event").post(controllers.create_event);
  //Join event.
  app.route("/join_event").post(controllers.join_event);
  //Create group.
  app.route("/create_group").post(controllers.create_group);
  //Join group.
  app.route("/join_group").post(controllers.join_group);
  //Generate schedule for event.
  app.route("/generate_schedule").post(controllers.generate_schedule);

  //Getters

  app.route("/get_event_information").get(controllers.get_event_information);

  app.route("/get_event_groups").get(controllers.get_event_groups);
  app.route("/get_event_schedule").get(controllers.get_event_schedule);
  app.route("/get_event_stations").get(controllers.get_event_stations);
  app.route("/get_users").get(controllers.get_users);
  app.route("/get_groups").get(controllers.get_groups);
};
