const controllers = require("../controllers/controllers");

module.exports = function (app) {
  //Root GETTER, returns "Hello World!".
  app.route("/root").get(controllers.root);

  app.route("/register_user").post(controllers.register_user);

  app.route("/login_user").post(controllers.login_user);

  app.route("/get_users").get(controllers.get_example);
};
