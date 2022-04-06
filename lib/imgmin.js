
require("colors")
const gulp     = require("gulp");
const plumber  = require("gulp-plumber")
const t2       = require("through2").obj;

module.exports = options => callback => {


    let { src, dest, mode, config, taskName } = {
        mode:false,
        config:{
            verbose:true
        },
        ... options
    }

    if ( ! mode ) {

        console.log(`[        ] ${'Image optimisation disabled'.yellow}`);
        return callback()
    }

    import("gulp-imagemin").then((imagemin)=>{
        gulp.src(src)
            .pipe( plumber() )
            .pipe( imagemin.default(config) )
            .pipe( t2( ( file, enc, cb ) =>
            {
                
                if( file.extname == ".svg" ) {

                    //==================== TAKE DATA ====================//
                    let data = file.contents.toString();
                    //===================================================//

                    if(data.indexOf("<?xml")==-1)
                        data = `<?xml version="1.0" encoding="UTF-8"?>${data}`
                    
                    //==================== OUT  DATA ====================//
                    file.contents = Buffer.from(data);
                    //===================================================//
                    
                }
                cb(null,file);
                
            }))
            .pipe( gulp.dest(dest) )
        .on('error', console.error )
        .on('end',   callback      )
    })
}