const { json } = require('express');
var fs = require('fs');// It works well using javascript
let db = require('../db/index')
const QRCode = require('qrcode');
// const QRCode = require('qrcode');
// import qrcode from 'qrcode';
// exports.all = (req, res) => {        //获取info表全部数据
//     var sql = 'select * from resign'
//     db.body(sql, (err, data) => {
//         if(err) {
//             return res.send('错误：' + err.message)
//         }
//         res.send(data)
//     })
// }
// exports.get = (req, res) => {        //通过id查询数据
//     var sql = 'select * from resign where name = ?'    //？用于占位
//     db.body(sql, [req.body.name], (err, data) => {
//         if(err) {
//             return res.send('错误：' + err.message)
//         }
//         res.send(data)
//     })
// }

// exports.del = (req, res) => {        //通过id删除数据
//     var sql = 'delete from info where id = ?'
//     db.body(sql, [req.body.id], (err, data) => {
//         if(err) {
//             return res.send('错误：' + err.message)
//         }
//         if(data.affectedRows > 0) {
//             res.send({
//               status: 200,
//               message: '删除成功'
//             })
//         }else{
//             res.send({
//               status: 202,
//               message: '删除失败'
//             })
//         }
//     })
// }

exports.add = async (req, res) => {        //向LivaCode表添加数据
  try {
    const CodeName = req.body.name;
    const CodeRqcnt = req.body.times;
    const CodePt = req.body.img_src.split(',')
    const token = req.body.token
    var mode = req.body.mode;
    const openid1 = await db.query('select openid from login where token = ?', [token]).then(async function (result) {
      // console.log(result[0][0].openid)
      // console.log(result[0])
      await db.query('insert into LiveCode (CodeName,CodeSelId,CodeRqcnt,openid,mode) values (?, ?, ?,?,?)', [CodeName, 0, CodeRqcnt, result[0][0].openid, mode])
    });
    // console.log(openid1)
    // 插入LiveCode表
    //  await db.query('insert into LiveCode (CodeName,CodeSelId,CodeRqcnt,openid) values (?, ?, ?,?)', [CodeName, 0, CodeRqcnt,openid2]);


    // 循环插入Code1表
    var CodeSelId;
    for (var i = 0; i < CodePt.length; i++) {
      const [result] = await db.query('insert into Code1 (CodeId,CodePt,CodeCnt,CodeName) values (?, ?, ?, ?)', [null, CodePt[i], 0, CodeName]);
      if (i == 0) {
        // console.log(result)
        CodeSelId = result.insertId;
      }
    }

    // 更新LiveCode表的CodeSelId
    await db.query('UPDATE livecode SET CodeSelId = ? WHERE CodeName = ?', [CodeSelId, CodeName]);
    const url = await sendcode(CodeName, mode);
    await savecodept(url, CodeName)
    return res.send({ url: url })
  } catch (err) {
    console.error(err);
    res.send({
      status: 0,
      message: 'err'
    })
  }
}

function sendcode(CodeName, mode) {
  console.log(CodeName)
  const data = `http://192.168.31.67:801/list/update?CodeName=${CodeName}&mode=${mode}` // 访问的接口url
  return new Promise((resolve, reject) => {
    QRCode.toDataURL(data, (err, url) => {
      if (err) {
        reject(err); // 如果有错误，返回错误给Promise的reject
      } else {
        // savecodept(url,CodeName);
        resolve(url); // 如果没有错误，返回URL给Promise的resolve
      }
    });
  });
}

exports.update = async (req, res) => {        //通过id更新数据
  var CodeName = req.query.CodeName;
  var mode = req.query.mode;
  if(mode == 0){
  select1(CodeName, (data) => {
    // console.log(data)
    update(data[1], CodeName);
    sendpt(data[0], res)
  })
  }
  else{
    var codept = await select2(CodeName)
    // console.log(codept)
    sendpt(codept,res)
  }
}
function update(CodeSelId, CodeName) {
  sql = 'UPDATE code1 SET CodeCnt = CodeCnt + 1 WHERE CodeId = ?;'
  db.query(sql, [CodeSelId], (err, data) => {
    if (err) {
      return res.send(err.message)
    } else {
      sql = 'UPDATE livecode SET CodeSelId = ? WHERE CodeName = ?;'
      db.query(sql, [CodeSelId, CodeName], (err, data) => {
        if (err)
          return res.send(err.message)
      })
    }
  })
}
function sendpt(CodePt, res) {
  // console.log(CodePt)
  var path = require("path");
  var fs = require('fs');
  const filePath = path.resolve(__dirname, `../../asset/${CodePt}`);
  // 给客户端返回一个文件流 type类型
  res.set('content-type', { "png": "image/png", "jpg": "image/jpeg" });//设置返回类型
  var stream = fs.createReadStream(filePath);
  var responseData = [];//存储文件流
  if (stream) {//判断状态
    stream.on('data', function (chunk) {
      responseData.push(chunk);
    });
    stream.on('end', function () {
      var finalData = Buffer.concat(responseData);
      // console(finalData)
      res.write(finalData);
      res.end();
    });
  }
}
function select1(CodeName, callback) {
  var sql = 'select CodeSelId,CodeRqcnt from LiveCode where CodeName = ?'    //？用于占位
  // console.log(req.query.CodeName)
  // console.log("sdfsdjfkl")
  db.query(sql, [CodeName], (err, data) => {
    if (err) {
      // console.log(err)
      return res.send('错误：' + err.message)
    } else {
      var CodeSelId = data[0].CodeSelId;
      var CodeRqcnt = data[0].CodeRqcnt;
      // var CodePt;
      // var CodeId = CodeSelId;
      // console.log(23)
      var sql = 'select CodeCnt,CodePt from code1 where CodeId = ?'    //？用于占位
      // console.log(CodeSelId)
      db.query(sql, [CodeSelId], (err, data) => {
        // console.log(data)
        if (data[0].CodeCnt < CodeRqcnt) {
          // const filePath = path.resolve(__dirname, `../asset/${data.CodePt}`);
          // // 给客户端返回一个文件流 type类型
          // res.set( 'content-type', {"png": "image/png","jpg": "image/jpeg"} );//设置返回类型
          // var stream = fs.createReadStream( filePath );
          // var responseData = [];//存储文件流
          // if (stream) {//判断状态
          //     stream.on( 'data', function( chunk ) {
          //       responseData.push( chunk );
          //     });
          //     stream.on( 'end', function() {
          //        var finalData = Buffer.concat( responseData );
          //        res.write( finalData );
          //        res.end();
          //     });
          // }
          callback([data[0].CodePt, CodeSelId]);
          // console.log(data)
        }
        else {
          // console.log(CodeSelId)
          var sql = 'SELECT CodePt,CodeId FROM code1 WHERE CodeName = ? AND CodeId > ? LIMIT 1'
          db.query(sql, [CodeName, CodeSelId], (err, data) => {
            // console.log("xx")
            var result = data;
            if (err) {
              return res.send(err.message)
            }
            else {
              sql = 'UPDATE code1 SET CodeCnt = 0 WHERE CodeId = ?;'
              db.query(sql, [CodeSelId], (err, data) => {
                if (err) {
                  return res.send(err.message)
                }
                else {
                  if (result.length == 0) {
                    sql = 'SELECT CodePt,CodeId FROM code1 WHERE CodeName = ? LIMIT 1'
                    db.query(sql, [CodeName], (err, data) => {
                      callback([data[0].CodePt, data[0].CodeId])
                    })
                  } else {
                    callback([result[0].CodePt, result[0].CodeId])
                  }
                }
              })
            }
            // console.log(err)
          })
          // console.log(1)
        }
        // console.log(code)
        // console.log(2)

      })
    }

  })
}
async function select2(CodeName){
  console.log(CodeName)
    var CodePt = await db.query('SELECT CodePt FROM code1 where CodeName = ? ORDER BY RAND() LIMIT 1;',[CodeName])
    console.log(CodePt)
    return CodePt[0][0].CodePt
}

function savecodept(url, CodeName) {
  //过滤图片url
  let base64 = url.replace(/^data:image\/\w+;base64,/, "")
  //把图片转换成buffer对象
  let dataBuffer = Buffer.from(base64, 'base64')
  //保存图片的地址是
  // let path = 'static/upload/image'+'.jpg'
  let path = '../../new/codept/' + CodeName + '.jpg'
  //保存图片
  fs.writeFile(path, dataBuffer, (err) => {
    if (err) {
      console.log(err)
    } else {
      console.log('保存图片成功')
      console.log(path)
    }
  })
}
// type
// {
//   "css": "text/css",
//   "gif": "image/gif",
//   "html": "text/html",
//   "ico": "image/x-icon",
//   "jpeg": "image/jpeg",
//   "jpg": "image/jpeg",
//   "js": "text/javascript",
//   "json": "application/json",
//   "pdf": "application/pdf",
//   "png": "image/png",
//   "svg": "image/svg+xml",
//   "swf": "application/x-shockwave-flash",
//   "tiff": "image/tiff",
//   "txt": "text/plain",
//   "wav": "audio/x-wav",
//   "wma": "audio/x-ms-wma",
//   "wmv": "video/x-ms-wmv",
//   "xml": "text/xml"
// }




