# Flatn

## Dependancies
- NodeJS
-- Windows Install - [http://nodejs.org/download/](http://nodejs.org/download/)
-- OSX Install - brew install node
-- Ubuntu - apt-get install nodejs
-- CentOS - yum install nodejs

- ImageMagick
-- OSX Install - brew install imagemagick
-- Windows - [http://www.imagemagick.org/script/binary-releases.php#windows](http://www.imagemagick.org/script/binary-releases.php#windows)
-- Ubuntu - apt-get install imagemagick
-- CentOS - yum install imagemagick

## Configure flatn.js

- Change `base_path` on line 17 to the base directory of images
- Change `flatn_to on line 20 to the directory where the images should goto.
- Change `thumbs_dir` on line 23 to where the thumbs directory should go
- Optional: Change the thumb height and width

## Run Flatn
`node flatn.js`