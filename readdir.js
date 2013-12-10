var readDirectory = function (start, ctype, callback) {
        var readDir, stash = {};
 
        ctype instanceof Function && ( callback = ctype, ctype = 1 );
 
        return (readDir = function(start, callback) {
            fs.lstat(start, function(err, stat) {
                if (err) return callback(err);

                var found = { dirs: [], files: [] },
                        total = 0, processed = 0;

                if (stat.isDirectory()) {
                    fs.readdir(start, function(err, files) {
                        total = files.length;

                        if (!total)
                                return callback(null, found, total);

                        files.forEach(function (a) {
                            var abspath = path.join(start, a);

                            fs.stat(abspath, function(err, stat) {
                                if (stat.isDirectory()) {

                                    ctype & 1 && found.dirs.push(abspath);
                                    ctype & 2 && (stash[abspath] = stat);

                                    readDir(abspath, function(err, data) {
                                        if ( ctype & 1 ) {
                                                found.dirs = found.dirs.concat(data.dirs);
                                                found.files = found.files.concat(data.files);
                                        }
                                        (++processed == total) && callback(null, found, stash);
                                    });
                                } else {
                                    ctype & 1 && found.files.push(abspath);
                                    ctype & 2 && (stash[abspath] = stat);
                                    (++processed == total) && callback(null, found, stash);
                                }
                            });
                        });
                    });
                } else {
                    return false;
                }
            });
        })(start, function (a, b, c) {
                if ( !(ctype ^ 3) )
                        return callback(b, c);
 
                if ( ctype & 1 )
                        return callback(b);
 
                if ( ctype & 2 )
                        return callback(c);
        });
};