const controllers = require("../controllers/controllers");

module.exports = function (app) {
  //Root GETTER, returns "Hello World!".
  app.route("/root").get(controllers.root);

  app.route("/register_user").post(controllers.register_user);

  app.route("/login_user").post(controllers.login_user);

  app.route("/create_event").post(controllers.create_event);

  app.route("/join_event").post(controllers.join_event);
};
