var fs = require('fs');
var gm = require('gm');
// var entity = gm();
// entity.options({
//     appPath: "F:\\GraphicsMagick-1.3.29-Q16\\"
// })
gm("./2.jpg").crop(141, 96, 152, 181).write("./dog.jpg", function (err) {
    console.log(err);
});