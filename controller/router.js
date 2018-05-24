var formidable = require("formidable");
var db = require("../models/db.js");
var crypto = require("../models/crypto.js");
var session = require('express-session');
var fs = require("fs");
var path = require("path");
//首页
exports.showIndex = function (req,res,next) {
   //每次渲染时查询username获得头像,必须在登录状态
    if(req.session.login === "1") {
        db.find("users",{"username": req.session.username},function (err,result) {
            var avatar = result[0].avatar || "default.jpg";
            res.render("index", {
                "login": req.session.login === "1" ? true : false,
                "username": req.session.login === "1" ? req.session.username : "",
                "avatar": avatar,
                "active": "全部说说"
            });
        })
    } else {
        res.render("index", {
            "login": req.session.login === "1" ? true : false,
            "username": req.session.login === "1" ? req.session.username : "",
            "avatar": "default.jpg",
            "active": "全部说说"
        });
    }
   
}
//注册页
exports.showRegist = function (req,res) {
    res.render("regist");
}
//注册业务
exports.doregist = function (req,res,next) {
    //首先获取输入的参数
    var form = new formidable.IncomingForm();
    form.parse(req, function (err, fields, files) {
       var username = fields.username;
       var password = crypto(fields.password);
      //查询数据库,返回状态-2为服务器错误,1为注册成功插入数据库,-1为用户名已存在
    db.find("users",{"username": username},function (err,result) {
        if(err) {
            res.send("-2");
            return;
        }
        if(result.length != 0) {
            res.send("-1");
        } else {
            db.insertArray("users",
            [{"username": username,"password": password,"avatar":"default.jpg"}],
            function (err,result) {
                if(err) {
                    res.send("-2");
                    return; 
                }
                req.session.login = "1";
                req.session.username = username;
                res.send("1");
            })
        }
    })
    });
}
//登录
exports.showlogin = function (req, res) {
        res.render("login");
}
//登录业务
exports.dologin = function (req, res, next) {
        //首先获取输入的参数
        var form = new formidable.IncomingForm();
        form.parse(req, function (err, fields, files) {
            var username = fields.username;
            var password = crypto(fields.password);
            //查询数据库
            db.find("users", { "username": username }, function (err, result) {
                if (err) {
                    res.send("-3");
                    return;
                }
                if (result.length == 0) {
                    res.send("-2");//用户名不存在
                } else {
                   if(password === result[0].password) {
                       req.session.login = "1";
                       req.session.username = username;
                       res.send("1");//登录成功
                   } else {
                       res.send("-1");//密码错误
                   }
                }
            })
        });   
}
//显示上传头像
exports.showAvatar = function (req,res) {
    res.render("avatar");
}
//上传头像业务
exports.doAvatar = function (req,res,next) {
    var username = req.session.username;
    var form = new formidable.IncomingForm();
    form.uploadDir = path.normalize(__dirname + "/../" + "avatar/images/");
    form.parse(req, function (err, fields, file) {
      var picture = file.tupian;
      var oldPath = picture.path;
      var newPath = form.uploadDir+picture.name;
      fs.rename(oldPath,newPath,function (err) {
             if(err) {
                 next();
                 return;
             }
        //修改数据库中的信息
        db.update("users",{"username": username},{$set:{"avatar": picture.name}},function (err,result) {
           if(err) {
               res.send("-2");
           }
           res.redirect("/");//跳转到首页
        })
      })

    })
}
//发表留言
exports.doFabiao = function (req,res,next) {
    var username = req.session.username;
    var form = new formidable.IncomingForm();
    form.parse(req, function (err, fields, files) {
        var content =  fields.liuyan;
        db.insertArray("posters",
            [{ "username": username, "content": content,"time": new Date()}],
            function (err, result) {
                if (err) {
                    res.send("-2");//服务器错误
                    return;
                }
                res.send("1");//成功
            })
    })
}
//获取发言列表
exports.doList = function (req,res,next) {
    db.find("posters", {},{"sort": {"time": -1 }},function (err,result) {
        if (err) {
            res.send("-2");
            return;
        }
        res.json(result);
    })
}
//获取列表头像
exports.doTouxiang = function (req,res,next) {
    var name = req.query.name;
    db.find("users", { "username": name }, function (err, result) {
        if (err) {
            res.send("-2");
            return;
        }
       res.json(result[0].avatar);
    }) 

}
//得到总数量
exports.dogetPageNum = function (req,res,next) {
    db.count("posters",function (err,result) {
        res.send(result);
    })
}
//获取分页内容
exports.doPage = function (req,res) {
    var page = req.query.page;
    db.find("posters", {}, { "pageamount": 2,"page": page ,"sort":{"time": -1}}, function (err, result) {
        res.json(result);
    })
}
//展示我的说说
exports.showUser = function (req,res,next) {
    var user = req.params["user"];
    db.find("posters",{"username": user},function (err,result) {
        db.find("users", { "username": user}, function (err, result2) {
            res.render("user", {
                "user": user,
                "active": "我的说说",
                "login": req.session.login === "1" ? true : false,
                "username": req.session.login === "1" ? req.session.username : "",
                "gerenshuoshuo": result,
                "avatar": result2[0].avatar
            });
        })
        
    })
    
}
//展示成员列表
exports.showUserList = function (req,res,next) {
    var username = req.session.username;
    db.find("users", {}, function (err, result) {
        res.render("userlist", {
            "active": "成员列表",
            "login": req.session.login === "1" ? true : false,
            "username": req.session.login === "1" ? req.session.username : "",
             "quanbuchengyuan": result
        });
    })
}