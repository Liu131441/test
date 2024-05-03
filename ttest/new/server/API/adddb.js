let db = require('../db/index')
exports.add = (req, res) => {        //添加表
    const tableName = req.body.tablename;
    const sql = 
  `CREATE TABLE ${tableName} (
    number varchar(10) DEFAULT NULL,
    Firmname varchar(45) DEFAULT NULL,
    area varchar(45) DEFAULT NULL,
    peoplename varchar(45) DEFAULT NULL,
    academy varchar(45) DEFAULT NULL,
    time varchar(45) DEFAULT NULL,
    remark varchar(45) DEFAULT NULL,
    img_src varchar(80) DEFAULT NULL
  ) `;
    var sql1 = 'insert into tb (tablename,username) values (?,?)'
    db.query(sql, (err,data) => {
        
        if(err) {
            return res.send('错误：' + err.message)
        }
        res.send(data)
    })
    db.query(sql1, [req.body.tablename,req.body.username],(err,data) =>{
        // console.log(req.body.tablename)
        if(err) {
            return res.send('错误：' + err.message)
        }
        res.send(data)
    })
}
