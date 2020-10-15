const controllers = require("../controllers/controllers");

module.exports = function (app) {
  //Root GETTER, returns "Hello World!".
  app.route("/root").get(controllers.root);

  // *** POST ROUTES ***

  /** Route: /register_user
   *
   * Adds user entry into database
   *
   * @param {string} email          - User input: user email address
   * @param {string} name           - User input: user first name and last name
   * @param {string} password       - User input: user password
   * @param {string} phonenumber    - User input: user phonenumber
   *
   * @returns {doc.id}              - Database document in collection "user" containing
   *                                 user information.
   *
   * @returns {error}               - TODO: This needs to be updated when validation is
   *                                       complete.
   * Status codes:
   *                                - {201} Successfully created a new user.
   *                                - {400} TODO: Update when validation is complete.
   */
  app.route("/register_user").post(controllers.register_user);

  /** Route: /login_user
   *
   * Checks if user email and password is equal to requested
   * database entry.
   *
   * @param {string} email          - User input: user email address
   * @param {string} password       - User input: user password
   *
   * @returns {userData}            - Database document in collection "user" containing
   *                                 user information.
   *
   * @returns {"Wrong password."}   -
   *
   * @returns {error}               - TODO: This needs to be updated when validation is
   *                                       complete.
   *
   * Status codes:
   *                                - {200} OK, returning user information.
   *                                - {401} Wrong password for email in collection.
   *                                - {404} Email not found in collection.
   *                                - {500} Internal server error.
   *
   */
  app.route("/login_user").post(controllers.login_user);

  /** Route: /create_event
   *
   * Creates a new event with a random 5-character code,
   * e-g ABCDE. (A-Z).
   *
   * @param {string} title          - User input: event title
   * @param {datetime} start_time   - User input: start time of event
   * @param {datetime} end_time     - User input: end time of event
   * @param {string} description    - User input: description of event
   * @param {string} creator_id     - User id
   * @param {string} creator_name   - User input: creator name
   * @param {string} creator_phone  - User input: creator phonenumber
   * @param {string} creator_email  - User input: creator email
   *
   *
   * @returns {event_code}          - Random 5-character code, this is also
   *                                 the ID of the document in this collection.
   *
   * Status codes:
   *                                - {200} OK, returning user information.
   *                                - {500} Internal server error.
   *
   */
  app.route("/create_event").post(controllers.create_event);

  /** Route: /join_event
   *
   * Adds user to event through event code.
   *
   * @param {string} user_id          - User collection field: user_id
   * @param {string} user_name        - User collection field: user_name
   * @param {string} user_email       - User collection field: user_email
   * @param {string} user_phonenumber - User collection field: user_phonenumber
   * @param {string} event_code       - User input: event_code
   *
   *
   * @returns {user_name}             - 'User added to event {user_name}'
   *
   * Status codes:
   *                                  - {200} OK, returning user information.
   *                                  - {500} Internal server error.
   *
   */
  app.route("/join_event").post(controllers.join_event);

  /** Route: /create_group
   *¨
   * Adds entry to "group" and "station" collection in
   * event identified by event_code.
   *
   * @param {string} user_id          - User collection field: user_id
   * @param {string} user_name        - User collection field: user_name
   * @param {string} user_phonenumber - User collection field: user_phonenumber
   * @param {string} user_email       - User collection field: user_email
   * @param {string} group_name       - User input: group_name
   * @param {string} group_address    - User input: group_name
   * @param {string} event_code       - Event collection field: event_code
   *
   * @returns {group_name}            - 'Group added to collection: {group.group_name}'
   *
   * Status codes:
   *                                  - {200} OK, returning user information.
   *                                  - {500} Internal server error.
   *
   */
  app.route("/create_group").post(controllers.create_group);

  /** Route: /join_group
   *
   * Adds entry to "group" collection.
   *
   */
  app.route("/join_group").post(controllers.join_group);

  /** Route: /generate_schedule
   *
   *
   */
  app.route("/generate_schedule").post(controllers.generate_schedule);

  /** Route: /join_group_in_event
   *
   * Adds entry to "members" collection in "group" document in "event" document.
   *
   *
   */
  app.route("/join_group_in_event").post(controllers.join_group_in_event);

  // *** GET ROUTES ***

  /** Route: /get_event_information
   *
   *
   */
  app.route("/get_event_information").get(controllers.get_event_information);

  /** Route: /get_event_groups
   *
   *
   */
  app.route("/get_event_groups").get(controllers.get_event_groups);

  /** Route: /get_event_schedule
   *
   *
   */
  app.route("/get_event_schedule").get(controllers.get_event_schedule);

  /** Route: /get_event_stations
   *
   *
   */
  app.route("/get_event_stations").get(controllers.get_event_stations);

  /** Route: /get_users
   *
   *
   */
  app.route("/get_users").get(controllers.get_users);

  /** Route: /get_groups
   *
   *
   */
  app.route("/get_groups").get(controllers.get_groups);
};
