const controllers = require("../controllers/controllers");

module.exports = function (app) {
  //Root GETTER, returns "Hello World!".
  app.route("/root").get(controllers.root);
  //Register user
  app.route("/register_user").post(controllers.register_user);
  //Login user
  app.route("/login_user").post(controllers.login_user);
  //Create event
  app.route("/create_event").post(controllers.create_event);
  //Join event
  app.route("/join_event").post(controllers.join_event);
  //Create group
  app.route("/create_group").post(controllers.create_group);
  //Join group
  app.route("/join_group").post(controllers.join_group);
};
