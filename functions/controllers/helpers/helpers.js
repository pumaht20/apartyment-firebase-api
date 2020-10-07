//Helper functions

exports.generate_event_code = function (length) {
	var result = "";
	var characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
	var charactersLength = characters.length;
	for (var i = 0; i < length; i++) {
		result += characters.charAt(Math.floor(Math.random() * charactersLength));
	}
	return result;
};

exports.add_minutes = function (date, minutes) {
	return new Date(date.getTime() + minutes * 60000);
};
