# folder structure example :

- ./img/

    - _convertor/
        - *.( jpg | jpeg | svg | tiff | webp )

    - _sprite_png/ 
        - test_png_sprite
            - *.png
        ...

    - _sprite_svg/
        - test_svg_sprite
            - *.svg
        ...

    - *.( jpg | jpeg | png | svg )
    ...

- ./www/
    - img/
        - convertor/

___

# gulpfile :

```javascript

const gulp  = require(`gulp`);

const {
    imgMin    ,
    spritePng , 
    spriteSvg , 
    nameConvertor 
} = require(`@x-system/image`);

let image_options = {

    sprite:{

        png:{

            mode:true, // do it or not

            sprites_folders: `${process.cwd()}/img/_sprite_png`, // just common folder
            dest           : "./www/img",
            dest_styl      : "./www/styl", // stylus mixins for sprite
            img_path_alias : "@img",       // path for img in stylus 
            config:{
                algorithm:'left-right'
            } 

        },

        svg:{

            mode:true,

            sprites_folders: `${process.cwd()}/img/_sprite_svg`, // just common folder
            dest           : "./www/img",

        }

    },

    convertor:{

        mode:true,

        /*  rename your images like this example (one or all options in any order after name and some ext):

            name-to.(jpg|jpeg|png|tiff|webp)  = convert ext
            name-rz(\d+)                      = resize width
            name-rt@2x                        = retina
            
            name-to.png-rz400-rt@2x.jpg       = example
        */
        src:["./img/convertor/*.{jpg,jpeg,tiff,png,webp}"],
        dest:"./www/convertor"

    },
    imgmin:{

        mode: true,

        src:[`./img/*.{jpg,jpeg,png,svg}`],
        dest:"./www/img",
        config:{
            verbose:true
        }

    }
}

gulp.task("imgmin"   , imgMin(options.imgmin))
gulp.task("png"      , spritePng(options.sprite.png))
gulp.task("svg"      , spriteSvg(options.sprite.svg))
gulp.task("convertor", nameConvertor(options.convertor))
```

