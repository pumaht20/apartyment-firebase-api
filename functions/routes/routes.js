const controllers = require("../controllers/controllers");

module.exports = function (app) {
  //Root GETTER, returns "Hello World!".
  app.route("/root").get(controllers.root);

  // *** POST ROUTES ***

  /** Route: /register_user
   *
   * Adds user entry into database
   *
   * @param {string} email         - User input: user email address
   * @param {string} name          - User input: user first name and last name
   * @param {string} password      - User input: user password
   * @param {string} phonenumber   - User input: user phonenumber
   *
   * @returns {doc.id}             - Database document in collection "user" containing
   *                                 user information.
   *
   * @returns {error}              - TODO: This needs to be updated when validation is
   *                                       complete.
   * Status codes:
   *                               - {201} Successfully created a new user.
   *                               - {400} TODO: Update when validation is complete.
   */
  app.route("/register_user").post(controllers.register_user);
  /** Route: /login_user
   *
   * Checks if user email and password is equal to requested
   * database entry.
   *
   * @param {string} email         - User input: user email address
   * @param {string} password      - User input: user password
   *
   * @returns {userData}           - Database document in collection "user" containing
   *                                 user information.
   *
   * @returns {"Wrong password."}  -
   *
   * @returns {error}              - TODO: This needs to be updated when validation is
   *                                       complete.
   *
   * Status codes:
   *                                 - {200} OK, returning user information
   *                                 - {401} Wrong password for email in collection.
   *                                 - {404} Email not found in collection.
   *                                 - {500} Internal server error.
   *
   */
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

  // *** GET ROUTES ***

  app.route("/get_event_information").get(controllers.get_event_information);

  app.route("/get_event_groups").get(controllers.get_event_groups);

  app.route("/get_event_schedule").get(controllers.get_event_schedule);

  app.route("/get_event_stations").get(controllers.get_event_stations);

  app.route("/get_users").get(controllers.get_users);

  app.route("/get_groups").get(controllers.get_groups);
};
