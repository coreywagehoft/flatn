var customColors = {
	levels: {

	},
	colors: {
		success: 'green',
		info: 'blue',
		warn: 'yellow',
		error: 'red'
	}
};

/**
 * Setting up logging for console and to a file for later review if needed
 */

var log = new (winston.Logger)({
	transports: [
		new (winston.transports.Console)({colorize: true}),
		new (winston.transports.File)({ filename: 'flatn.log', level: 'error'})
	]
});

// Color Support for Logging?
winston.addColors(customColors.colors);