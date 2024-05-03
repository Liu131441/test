const multiparty = require('multiparty')
const fs = require('fs')
// /addSize这里只是一个接口地址，可以随意填写

exports.post = (req, res) => {
    // 获取协议（http或者https）
    // console.log(req.protocol)
    const ht = req.protocol
    // 设置文件存储路径
    let form = new multiparty.Form({ uploadDir: '../asset' })
    // 获取域名和端口号
    const host = req.headers.host
    // console.log(host)
    
    form.parse(req, (err, msg, files) => {
        try {
            // 获取文件信息
            // console.log(files)
            // console.log(form)
            let inputFile = files.file[0]
            // console.log(inputFile)
            let newPath = form.uploadDir + "/" + inputFile.originalFilename
            // 将文件名重命名为图片文件原有名字
            fs.renameSync(inputFile.path, newPath)
            // 将上传目标相对路径提取出来，去掉第一个字符.  这里看不懂的可以congole打印一下form.uploadDir就明白了
            const uploadDir = form.uploadDir.substr(1)
            // 拼接得到图片地址
            // let url = ht + "://" + host + uploadDir + "/" + inputFile.originalFilename
            let url = inputFile.originalFilename
            console.log(url)
            res.send(url)
        } catch (error) {
            console.error(err)
        }
    })
}