
let db = require('../db/index')
// const connect = require('https');
var axios = require('axios')
// 开发者信息
const wx = {
    appid:'wxf4e7d82bc594be24',  // 填写用户自己的appid
    secret:'8dce196b8fb0b3fef2158e65101e3c78'  // 填写用户自己的密钥
}
 
// 写在app.listen即可
// '/login'即响应在小程序中的请求http://127.0.0.1:3000/login
exports.post = (req,res)=>{
    var url = 'https://api.weixin.qq.com/sns/jscode2session?appid=' + wx.appid + '&secret=' + wx.secret + '&js_code=' + req.body.code + '&grant_type=authorization_code'
    var token = 'token_' + new Date().getTime()
    axios({url}).then(async (res)=>{
        var session = res.data
        var openid = session.openid
        console.log(1,openid);
        var sql = 'select * from login where openid = ?'
        // console.log(db)
        const result = await db.query(sql,[openid])
        console.log(result[0])
        if(result[0].length == 0){
             await db.query('insert into login (token,openid) values (?, ?)', [token,openid]);
        }
        else{
             await db.query('UPDATE login SET token = ? WHERE openid = ?', [token, openid]);
        }
        // console.log(2222222)
    }).catch((err)=>{
        console.log(2,err)
    })
    return res.json({
        token: token  // 返回token
    })
} 

exports.get=async (req,res)=>{
   const token = req.query.token
   var data = await db.query('select openid from login where token = ?',[token])
   var is_login
   if(data[0] == []){
        is_login = false
    }
    else{
        is_login = true
    }
    res.json({
        is_login:is_login
    })
}