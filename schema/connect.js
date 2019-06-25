const mongoose = require('mongoose')
const db = mongoose.createConnection("mongodb://localhost:27017/community",{
    useNewUrlParser: true
})

const Schema = mongoose.Schema

db.on('open', () => {
    console.log('数据库连接成功')
})
db.on('error', () => {
    console.log('数据库连接失败')
})



module.exports = {
    db,
    Schema
}