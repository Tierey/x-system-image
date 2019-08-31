require("colors")

const gulp  = require('gulp');
const t2    = require("through2").obj;

const File  = require(`vinyl`);
const sharp = require(`sharp`);
const plumber = require(`gulp-plumber`);

// name-to.(jpg|jpeg|png|tiff|webp)
// name-rz(\d+)
// name-rt@2x
// name-to.jpg-rz400-rt@2x.png
module.exports = options => callback => {

    let { mode, dest, src, taskName } = {

        ... options
    }
    
    if ( ! mode ) {
        console.log(`[        ] ${'mode:false for sharp.'}`)
        return callback() 
    }


    gulp.src(src)
    .pipe( plumber() )

    .pipe( t2( async function (file,enc,cb){

        let img = {
            height : false,
            width  : false,
            ext    : false,
            toext  : false,
            resize : false,
            retina : false,
            buffer : false,
        }

        img.ext = file.extname.replace(".","");

        // take need data
        await new Promise((resolve,reject)=>{
            sharp(file.contents)
            .toBuffer((err, data, info) => {
                if(err)reject(err)
                console.log(file.stem)
                img.width  = info.width
                img.height = info.height
                img.buffer = data
                resolve()
            })
        });

        // format to ext
        file.stem = file.stem.replace(/-to\.(jpg|jpeg|png|tiff|webp)/,(m,toext)=>{
            if(toext=='jpg'){
                file.extname = '.jpg'
                img.toext    = 'jpeg'
            }else{
                file.extname = `.${toext}`
                img.toext    = toext
            }
            return ""
        })

        if(img.toext)
        await new Promise((resolve,reject)=>{
            sharp(img.buffer)
            .toFormat(img.toext)
            .toBuffer((err, data, info) => {
                if(err)reject(err)
                img.buffer = data
                resolve()
            })
        });

        // resize
        file.stem = file.stem.replace(/-rz(\d+)/,(m,size)=>{
            img.resize = parseInt(size);
            return ""
        })
        if(img.resize)
        {
            if(img.resize < parseInt(img.width))
            {
                await new Promise((resolve,reject)=>{
                    sharp(img.buffer)
                    .resize(img.resize)
                    .toBuffer((err, data, info) => {
                        if(err)reject(err)
                        img.width  = info.width
                        img.height = info.height

                        img.buffer = data
                        resolve()
                    })
                });
            }else{
                console.log("Cant resize by width < resize width")
            }
        }

        // progressive

        if((~img.ext.indexOf('png'))||(~img.ext.indexOf('jpg')))
        {
            await new Promise((resolve,reject)=>{
                let s = sharp(img.buffer)
                if(~img.ext.indexOf('png'))
                s = s.png ({progressive : true})
                else
                s = s.jpeg({progressive : true})
                s.toBuffer((err, data, info) => {
                    if(err)reject(err)
                    img.buffer = data
                    resolve()
                })
            });
        }

        if(~file.stem.indexOf('-rt@2x'))
        {
            file.stem = file.stem.replace("-rt@2x","@2x")
            await new Promise((resolve,reject)=>{
                sharp(img.buffer)
                .resize(img.width/2)
                .toBuffer((err, data, info) => {
                    if(err)reject(err)
                    this.push(new File({
                        cwd:      file.cwd,
                        base:     file.base,
                        path:    `${file.path.replace(/\\/g,"/").split('/').slice(0,-1).join('/')}/${file.stem.replace("@2x","@1x")}${file.extname}`,
                        contents: data
                    }))
                    resolve()
                })
            });
        }

        file.contents = img.buffer

        cb(null,file);

    }) )
    .pipe( gulp.dest(dest) )
    .on('error',console.error)
    .on('end',callback)
}
