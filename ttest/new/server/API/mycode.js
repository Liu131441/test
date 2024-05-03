const fs = require('fs')
const path = require('path')
let db = require('../db/index')
exports.post = async (req, res) => {        //通过id更新数据
  // console.log(req.body)
  token = req.body.token
  const result = await db.query('select openid from login where token = ?', [token])
  const openid = result[0][0].openid
  const data = await db.query('select CodeName,CodeRqcnt from livecode where openid = ?', [openid])
  // const pt = sendpt(CodeName);
  // for(var obj of data[0]){
  //     // console.log(obj)
  //     CodeName = obj.CodeName
  //     await sendpt(CodeName,obj);
  //     console.log(data[0])
  // }
  for (var obj of data[0]) {
    var CodePt = await promise(obj);
    obj.CodePt = CodePt;
    // console.log(data[0]);
  }
  // console.log(data[0]);
  return res.send(
    data[0]
  )
}

const promise = (obj) => new Promise((resolve, reject) => {
  // console.log(CodePt)
  CodeName = obj.CodeName
  var path = require("path");
  var fs = require('fs');
  const filePath = path.resolve(__dirname, `../../codept/${CodeName}.jpg`);
  // 给客户端返回一个文件流 type类型
  //   res.set('content-type', { "png": "image/png", "jpg": "image/jpeg" });//设置返回类型
  var stream = fs.createReadStream(filePath);
  var responseData = [];//存储文件流
  if (stream) {//判断状态
    stream.on('data', function (chunk) {
      responseData.push(chunk);
    });
    stream.on('end', function () {
      var finalData = Buffer.concat(responseData);
      var Codept = finalData.toString('base64')
      //   obj.Codept = Codept;
      //  console.log(Codept)
      return resolve(Codept);
    });
  }
})

exports.delete = async (req, res) => {
  CodeName = req.body.detcodename
  var bigcode = CodeName + '.jpg'
  console.log(bigcode)
  try {
    var result = await db.query('select CodePt from code1 where CodeName = ?', [CodeName])
    console.log(result)
    Codeptarr = result[0]
    for (let index = 0; index < Codeptarr.length; index++) {
      deletept('../asset/', Codeptarr[index].CodePt)
    }
    deletept('../codept/',bigcode)
    db.query('delete from livecode where CodeName = ?', [CodeName])
    db.query('delete from code1 where CodeName = ?', [CodeName])
    return res.send({
      status: 200
    })
  }
  catch (err) {
    // console.log(err)
    return res.send({
      status: 0
    })
  }
}

function deletept(dirPath, name) {
  var path = dirPath + name
  // console.log(path)
  fs.unlink(path, (err) => {
    // console.log(err)
  })
}
// function sendpt(obj) {
//   // console.log(CodePt)
//     CodeName = obj.CodeName
//   var path = require("path");
//   var fs = require('fs');
//   const filePath = path.resolve(__dirname, `../../codept/${CodeName}.jpg`);
//   // 给客户端返回一个文件流 type类型
// //   res.set('content-type', { "png": "image/png", "jpg": "image/jpeg" });//设置返回类型
//   var stream = fs.createReadStream(filePath);
//   var responseData = [];//存储文件流
//   if (stream) {//判断状态
//     stream.on('data', function (chunk) {
//       responseData.push(chunk);
//     });
//     stream.on('end', function () {
//       var finalData = Buffer.concat(responseData);
//       var Codept = finalData.toString('base64')
//     //   obj.Codept = Codept;
//       console.log(Codept)
//     return Codept;
//     });
//   }
// }