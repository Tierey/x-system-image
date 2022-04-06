
require("./fs")

const gulp        = require('gulp');

const t2          = require("through2").obj;
const plumber     = require(`gulp-plumber`);
const rename      = require(`gulp-rename`);
let   imagemin    = import('gulp-imagemin');
const spritesmith = require('gulp.spritesmith');
const buffer      = require('vinyl-buffer');

const colors      = require('colors');

const {prompt}    = require('enquirer');


async function what_sprite_folder (sprites_folders)
{
    return new Promise ((resolve,reject) =>
    {

        console.log(`\n[${' sprite '.rainbow}]\n`)
        prompt({
            type    : 'select',
            name    : 'folder_name',
            message : `Выберите ${'папку'.yellow} :`,
            choices : global.take_all_dirs(sprites_folders).map(v=>v.yellow)
        })
        .then(asw => {
            asw.folder_name = colors.strip( asw.folder_name )
            resolve(asw)
        })
        .catch( err => {
            reject(err)
        });

    })
};

module.exports = options => async callback => {

    let { mode, dest, dest_styl, sprites_folders, config, img_path_alias, taskName, min } = {

        img_path_alias:"@img",
        config:{
            algorithm:'left-right'
        },
        min:false,
        ... options
    }

    if ( ! mode ) {
        console.log(`[        ] ${'mode:false for sprite png.'}`)
        return callback() 
    }

    let algoritm  = config.algorithm; // https://www.npmjs.com/package/gulp.spritesmith#algorithms

    let answer    = await what_sprite_folder(sprites_folders) // { sprite_folder: 'social' }
    let folder    = answer.folder_name;
    let src_path  = `${sprites_folders}/${folder}`

    let src       = `${src_path}/*.{png,jpeg,jpg}`
    
    imagemin = await imagemin
    await new Promise( (resolve, reject) => {

        gulp.src(src)
        .pipe( plumber() )
        .pipe( rename({ prefix: `${folder}_` }))
        .pipe( spritesmith({
            imgName  : `${folder}.png`,
            cssName  : `${folder}.styl`,
            algorithm: algoritm,
            imgPath  : `${img_path_alias}/${folder}.png`,
            padding  : 1
        }))
        .pipe( buffer() ) // иначе dest ругается
        .pipe( min?imagemin.default():t2((file, enc, cb) =>cb(null,file)))
        .pipe( t2( (file, enc, cb) =>
        {

            if(file.extname=='.png')
                console.log(`\n[${' sprite '.green}] ${dest}/${file.basename.green}`)
            if(file.extname=='.styl')
            {
                console.log(`[${' sprite '.yellow}] ${dest_styl}/${file.basename.yellow}\n`)
                //==================== TAKE DATA ====================//
                let data = file.contents.toString()
                //===================================================//

                data = data.replace(/('\S*')/gm,(m,s)=>`(${s})`)
                data = data.replace(/spritesheet/gm,folder)

                //==================== OUT  DATA ====================//
                file.contents = Buffer.from(data)
                //===================================================//

            }

            cb(null,file)
        }))
        .pipe( gulp.dest(file=>{

            if(file.extname=='.styl')
            {
                return dest_styl
            }
            return dest
        }))
        .pipe( t2((file,enc,cb)=>{
            resolve()
        }))
        .on('error',console.error)
        .on('end',resolve)
    
    })
    callback()
}