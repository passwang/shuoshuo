var express = require("express");
var app = express();
var router = require("./controller/router.js");
var session = require("express-session");
app.use(session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: true
}))
//模板引擎
app.set("view engine","ejs");
//静态文件
app.use(express.static("./public"));
app.use(express.static("./avatar"));
//路由表
app.get("/",router.showIndex);
app.get("/regist",router.showRegist);
app.post("/doregist",router.doregist);
app.get("/login", router.showlogin);
app.post("/dologin", router.dologin);
app.get("/getAvatar",router.showAvatar);//显示头像
app.post("/setAvatar",router.doAvatar);//上传头像
app.post("/fabiao",router.doFabiao);//发表留言
app.get("/list",router.doList);//获取留言列表
app.get("/touxiang", router.doTouxiang);//获取留言头像
app.get("/getPageNum", router.dogetPageNum);//获取总数量
app.get("/page",router.doPage);//获取分页内容
app.get("/user/:user",router.showUser);//获取我的说说内容
app.get("/userlist",router.showUserList);//获取成员列表内容
app.listen(3000);