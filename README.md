# Flatn

NodeJS script to flatten directory structure and create thumbs of images within them

### Dependancies

#### NodeJS
* OSX Install - `brew install node`
* Windows Install - [http://nodejs.org/download/](http://nodejs.org/download/)
* Ubuntu - `apt-get install nodejs`
* CentOS - `yum install nodejs`

#### ImageMagick
* OSX Install - `brew install imagemagick`
* Windows - [http://www.imagemagick.org/script/binary-releases.php#windows](http://www.imagemagick.org/script/binary-releases.php#windows)
* Ubuntu - `apt-get install imagemagick`
* CentOS - `yum install imagemagick`

### Configure flatn.js

Open config.js and change your paths accordingly.

1. Change `base_path` to the base directory of images
2. Change `flatn_to` to the directory where the images should goto.
3. Change `thumbs_dir` to where the thumbs directory should go
4. Optional: Change the thumb height and width

### Run Flatn
`node flatn.js`
