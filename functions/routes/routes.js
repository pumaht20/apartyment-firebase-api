const controllers = require("../controllers/controllers");

module.exports = function (app) {
  //Root GETTER, returns "Hello World!".
  app.route("/root").get(controllers.root);

  app.route("/example").post(controllers.post_example);
};
