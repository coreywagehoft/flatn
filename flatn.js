/**
 *  -- Flatn --
 * @author Corey Wagehoft - Dom & Tom 2013
 *
 * This will recursively go into folders move images down to a defined base path,
 * create a thumbnail using GD and another "large file version"
 *
 * ## DEPENDANCIES ##
 * ImageMagick
 * 
 */

// Uploads Directory Absolute Path
var base_path = '/Users/coreywagehoft/Projects/flatn/uploads/awpcp';

// Directory to send images down to. "Flatn"
var flatn_to = '/Users/coreywagehoft/Projects/flatn/uploads/awpcp';

// Thumb Options
var thumbs_dir = '/Users/coreywagehoft/Projects/flatn/uploads/awpcp/thumbs';
var thumb_width = 300;
var thumb_height = 125;

/**
 * Libraries Required
 */
var fs = require('fs');
var im = require('imagemagick');
var log = require('winston');
var path = require('path');
var async = require('async');
eval(fs.readFileSync('readdir.js')+'');

var customColors = {
	success: 'green',
	info: 'blue',
	warn: 'yellow',
	error: 'red'
};

log.addColors(customColors);

/*
 * Scoped Variableds
 */
var files = [];

async.series([


	function(next_step) {

		/**
		 * Recursively read back through all of the directories and returns an
		 * array of files into the files var.
		 */
		readDirectory(base_path, 1, function(callback) {
			console.log(callback.files);

			files = callback.files;
			next_step();
		});

	},

	function(next_step) {
	// Make the thumbs directory if it does not exist
		if(thumbs_dir) {
			
			fs.exists(thumbs_dir,function(exists) {

				if(!exists) {
					fs.mkdirSync(thumbs_dir);
				}
				next_step();
			});

		} else {
			next_step();
		}
	},

	function(next_step) {
		// Loop through all of the returned files to move them and create
		// thumbs if we want them
		// We force this to be syncronous as to not overload the cpu with all
		// of the GD
		async.eachSeries(files, function(file){


			// Get the filename out of the absolute path
			var filename = file.replace(/^.*[\\\/]/, '');
			var file_sliced = filename.slice(0, -4);

			async.series([

				// Resize the images if we have a thumbs directory
				function(next_step) {

					if(thumbs_dir) {

						height = thumb_height ? thumb_height : 0;
						width = thumb_width ? thumb_width : 0;

						im.identify(file, function(err,features) {

							if(features && (features.format == 'JPEG' || features.format == 'PNG')) {
								// Image magick resizing
								im.resize({
									srcPath: file,
									dstPath: thumbs_dir + '/' + filename,
									width: width,
									height: height
								}, function(err, stdout, stderr) {

									if(!err) {
										log.success('Resize Successful: ' + filename);
										next_step();
									} else {
										log.error('Error: ' + err);
										next_step(err);
									}

									if(stderr) {
										log.error('stderr: ' + stderr);
										next_step(err);
									}
								});
							} else {

								next_step();
							}
						});
						

					} else {
						next_step();
					}
				},
				// Move the image to the flatn_to dir
				function(next_step) {

					var to = flatn_to + '/' + filename;
					console.log(to);

					fs.rename(file, to, function(cb) {
						if(cb) {
							next_step();
						} else {
							next_step('Error Moving File: ' + file);
						}
					});
				}
			], function(err) {
				if(!err) {
					log.success('File Moved: ' + filename);
				} else {
					log.error(err);
				}
			});
		},function(err) {
			if(err) {
				log.error('ERROR');
			}
		});

		next_step();
	}
], function() {
	log.info(' #### DONE WITH FLATN ####');
});
