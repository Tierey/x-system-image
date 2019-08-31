
const gulp = require(`gulp`);

const __imgmin     = require(`./lib/imgmin`);
const __sprite_png = require(`./lib/sprite_png`);
const __sprite_svg = require(`./lib/sprite_svg`);
const __sharp      = require(`./lib/sharp`);


module.exports.imgMin = function ( options ) {

    return gulp.series(

        function imgmin (callback) {

            __imgmin(options).call(this,callback)

        }
    )
}

module.exports.spritePng = function ( options ) {

    return gulp.series(

        function sprite_png (callback) {

            __sprite_png(options).call(this,callback)

        }
    )
}

module.exports.spriteSvg = function ( options ) {

    return gulp.series(

        function sprite_svg (callback) {

            __sprite_svg(options).call(this,callback)

        }
    )
}

module.exports.nameConvertor = function ( options ) {

    return gulp.series(

        function image_convertor (callback) {

            __sharp(options).call(this,callback)

        }
    )
}