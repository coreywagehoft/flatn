/**
 *  -- Flatn --
 * @author Corey Wagehoft - Dom & Tom 2013
 *
 * This will recursively go into folders move images down to a defined path,
 * create a thumbnail using ImageMagick and another "large file version".
 */

/**
 * Libraries Required
 */
var fs = require('fs');
var im = require('imagemagick');
var winston = require('winston');
var path = require('path');
var async = require('async');
eval(fs.readFileSync('config.js')+'');
eval(fs.readFileSync('utils/utils.js')+'');
eval(fs.readFileSync('utils/logging.js')+'');

/*
 * Scoped Variableds
 */
var files = [];
var directories = [];
var base_path = Config.base_path;
var flatn_to = Config.flatn_to;
var thumbs_dir = Config.thumbs_dir;
var thumb_width = Config.thumb_width;
var thumb_height = Config.thumb_height;

/**
 * Ok Lets get down the business.  Running things syncronous to make sure
 * nothing happens out of order, with a large dataset this is very possible.
 */
async.series([

	function(next_step) {

		/**
		 * Recursively read back through all of the directories and returns an
		 * array of files into the files var.
		 */
		
		log.info('Reading Files...');

		readDirectory(base_path, 3, function(callback) {
			files = callback.files;
			directories = callback.dirs;
			next_step();
		});

	},

	function(next_step) {
	// Make the thumbs directory if it does not exist
		if(thumbs_dir) {

			log.info('Checking for Thumbs Directory..');
			fs.exists(thumbs_dir,function(exists) {

				if(!exists) {
					fs.mkdirSync(thumbs_dir);
					log.info('Thumbs Directory Created');
				}
				next_step();
			});

		} else {
			next_step();
		}
	},

	// Remove files like .DS_Store and Thumbs.db
	function(next_step) {

		log.info('Checking for files we need to remove..');

		async.eachSeries(files, function(file,next_each) {

			// Gets the filename from the absolute path;
			var filename = file.replace(/^.*[\\\/]/, '');

			if(filename == 'Thumbs.db' || filename == '.DS_Store' || filename == 'Thumb.db') {

				fs.unlink(file, function(err) {

					if(err) {
						log.error('Error Removing File: ' + err + ' File: ' + file);
						next_each();
					} else {

						// Now after we have removed the unneeded file
						// Lets remove it from the files array so that 
						// imagemagick does not try to convert it
						
						var index = files.indexOf(file);

						if(index > -1) {
							files.splice(index, 1);
						}

						next_each();
					}
				});

			} else {
				next_each();
			}

		}, function(err) {
			if(err) {
				log.error('Error Removing Files: ' + err);
			} else {
				log.info('Removed Unneeded Files');
			}

			next_step();
		});
	},

	function(next_step) {
		// Loop through all of the returned files to move them and create
		// thumbs if we want them
		// We force this to be syncronous as to not overload the cpu with all
		// of the GD
		
		console.log('');
		log.info('Processing image thumbnails & moving images..');
		console.log('');

		async.eachSeries(files, function(file,next_each) {

			// Get the filename out of the absolute path
			var filename = file.replace(/^.*[\\\/]/, '');
			var file_sliced = filename.slice(0, -4);

			async.series([

				function(inner_next_step) {

					console.log('');
					log.info('******************************************');
					log.info('** Processing File: ' + filename);

					inner_next_step();
				},

				// Resize the images if we have a thumbs directory
				function(inner_next_step) {

					if(thumbs_dir) {

						var height = thumb_height ? thumb_height : 0;
						var width = thumb_width ? thumb_width : 0;

						im.identify(file, function(err,features) {

							if(features && (features.format == 'JPEG' || features.format == 'PNG')) {

								// Image magick resizing
								im.resize({
									srcPath: file,
									dstPath: thumbs_dir + filename,
									width: width,
									height: height
								}, function(err, stdout, stderr) {

									if(!err) {
										log.info('* Resize Successful');
										inner_next_step();
									} else {
										log.error('* Resize Error: ' + err);
										inner_next_step(err);
									}

									if(stderr) {
										log.error('stderr: ' + stderr);
										inner_next_step(err);
									}
								});

							} else {

								inner_next_step();
							}
						});

					} else {
						inner_next_step();
					}
				},
				// Move the image to the flatn_to dir
				function(inner_next_step) {

					// Create the to absolute path
					var to = flatn_to + filename;

					// rename is how to move files with nodejs
					fs.rename(file, to, function(cb) {
						if(cb) {
							inner_next_step('Error Moving File: ' + file);

						} else {
							inner_next_step();
						}
					});
				},

				// Create another copy of the original file with the -large extension to it
				function(inner_next_step) {

					// Create the to absolute path
					var file_path = flatn_to + filename;
					var file_sliced = filename.slice(0, -4);
					var extension = (/[.]/.exec(filename)) ? /[^.]+$/.exec(filename) : undefined;

					// Now lets copy this file
					fs.createReadStream(file_path)
					.pipe(fs.createWriteStream(flatn_to + file_sliced + '-large.' + extension));

					log.info('* Large version created');

					inner_next_step();
				}

			], function(err) {
				if(!err) {
					log.info('* File Moved');
					log.info('******************************************');

					next_each();
				} else {
					log.error(err);
					next_each();
				}
			});

		},function(err) {
			if(err) {
				log.error('ERROR');
			}
			next_step();
		});

	},

	// Clean up our mess after flattening everything
	function(next_step) {

		async.eachSeries(directories, function(directory, next_each) {

			deleteFolderRecursive(directory);
			next_each();

		}, function() { next_step(); });

	}], function(err) {

	if(err) {
		log.error(err);
	} else {

		console.log('');
		log.info('Images Processed: ' + files.length);
		log.info(' #### FLATN IS COMPLETE ####');
		console.log('');
	}
});