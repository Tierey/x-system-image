

require("./fs")
const gulp     = require('gulp');
const t2       = require("through2").obj;
const plumber  = require(`gulp-plumber`);
const rename   = require(`gulp-rename`);
const svgstore = require(`gulp-svgstore`);
const imagemin = require('gulp-imagemin');
const colors   = require('colors');
const {prompt} = require('enquirer');



module.exports = options => async callback => {

    let { mode, dest, sprites_folders,taskName } = {

        img_path_alias:"@img",
        config:{
            
        },
        ... options
    }

    if ( ! mode ) {
        console.log(`[        ] ${'mode:false for sprite svg.'}`)
        return callback() 
    }

    console.log(`\n[${' sprite '.rainbow}]\n`)

    let answer = await prompt({
        type   : 'select',
        name   : 'folder_name',
        message: `Выберите ${'папку'.yellow}: `,
        choices: global.take_all_dirs(sprites_folders).map(v=>v.yellow)
    })

    let folder  = colors.strip( answer.folder_name )
    let svg_src = `${sprites_folders}/${folder}`
    let src     = `${svg_src}/*.svg`
    await new Promise( (resolve, reject) => {
        gulp.src(src)
        .pipe( plumber() )
        .pipe( rename({ prefix:"svg-" }) )
        .pipe( svgstore({inlineSvg: true}) )
        .pipe( 
            imagemin([
                imagemin.svgo({
                    js2svg: {
                        pretty: true,
                    },
                    plugins: [
                        {cleanupIDs:false},
                    ]
                })
            ])
        )
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
        .pipe( rename({ basename:folder }))
        .pipe( t2( function onstart (file, enc, cb)
        {

            //==================== TAKE DATA ====================//
            let data = file.contents.toString()
            //===================================================//

            data = data.replace("<svg","<svg style='display:none;'")

            console.log(`\n[${' sprite '.green}] ${dest}/${file.basename.green}`)
            console.log(`\n[${' sprite '.yellow}] css id has be changed by ${'svg-'.yellow}filename\n`)

            //==================== OUT  DATA ====================//
            file.contents = Buffer.from(data)
            //===================================================//
            cb(null,file)
        }))
        .pipe( gulp.dest(dest) )
        .pipe( t2((file,enc,cb)=>{
            resolve()
        }))
        .on('error',console.error)
        .on('end',callback)

    })

    callback()

}
