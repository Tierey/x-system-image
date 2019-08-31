const cp      = require(`${process.cwd()}/paths`);

const gulp    = require('gulp');
const plumber = require('gulp-plumber');
const t2      = require("through2").obj;
const sharp   = require(`sharp`);
const del     = require(`del`);


module.exports = options => async callback => {

    let _tn = options.taskName;
    let src =
    [
        `${cp.img}/sharp/cursor*.png`,
    ];
    let dest = `${cp.build}/assets/img`;
    del.sync(dest)

    await new Promise ( (r,rj) => {

        gulp.src(src)
        .pipe( plumber() )

        .pipe( t2( async function (file,enc,cb){

            let jpeg = {
                quality     : 80  ,
                progressive : true,
            }
            console.log(file.stem)
            await new Promise((resolve,reject)=>{
                sharp(file.contents)
                //.jpeg({jpeg})
                .resize(48,48)
                .toBuffer((err, data, info) => {
                    if(err)reject(err)
                    file.extname=`.${info.format}`
                    if(info.format == 'jpeg')
                        file.extname=`.jpg`
                    file.contents = data
                    resolve()
                })
            });

            cb(null,file);

        }))
        .pipe( gulp.dest(`${dest}`) )
        .pipe( t2((file,enc,cb)=>{
            r()
        }))

        .on('error',console.error)
        .on('end',r())
    })

    callback()
}
