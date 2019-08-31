const fs = require('fs');
const path = require('path');

global.x_del_dir?console.log(`global.del_dir already exist!`):global.del_dir=function (dir_path) {

    function rimraf(dir_path) {
        if (fs.existsSync(dir_path)) {
            fs.readdirSync(dir_path).forEach(function (entry) {
                var entry_path = path.join(dir_path, entry);
                if (fs.lstatSync(entry_path).isDirectory()) {
                    rimraf(entry_path);
                } else {
                    fs.unlinkSync(entry_path);
                }
            });
            fs.rmdirSync(dir_path);
        }
    }
    rimraf(dir_path);
}


global.x_take_all_dirs?console.log(`global.take_all_dirs already exist!`):global.take_all_dirs=function (p) {

    let result = fs.readdirSync(p).filter(f => fs.statSync(path.join(p, f)).isDirectory()).sort();
    if(!result) console.log(`take_all_dirs error`,result)
    return result; // [ '_all', 'index' ]
}

global.x_writeFileSync?console.log(`global.writeFileSync already exist!`):global.writeFileSync=function (p,data) {

    let dir = p.dash().dir().replace(process.cwd().dash()+"/","")
    let arr = dir.split("/")
    let result=[]
    for (let i = 0; i < arr.length; ++i) {
        result.push(arr.slice(0,arr.length-i).join("/"))
    }
    result = result.reverse()
    result.forEach(dir=>{
        if (!fs.existsSync(dir)) fs.mkdirSync(dir)
    })
    fs.writeFileSync(p.dash(),data)
}


