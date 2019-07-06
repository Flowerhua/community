const Koa = require('koa')
const koaBody = require('koa-body')
const koaStatic = require('koa-static')
const koaViews = require('koa-views')
const { join } = require('path')
const router = require('./router/router')
const koaSession = require('koa-session')
const koaCompress = require('koa-compress')

const app = new Koa

// session 的秘钥
app.keys = ['这是秘钥 233']

// session 的配置对象
const CONFIG = {
    key: 'koa:sess',
    maxAge: 36e5,
    autoCommit: true,
    overwrtie: true,
    httpOnly: true,
    signed: true,
    rolling: true
}

// session 中间件
app.use(koaSession(CONFIG,app))

// 资源压缩
app.use(koaCompress({
    threshold: 2048,
    flush: require('zlib').Z_SYNC_FLUSH
}))

// post 请求中间件
app.use(koaBody())

// 静态资源管理
app.use(koaStatic(join(__dirname, 'public')))

// 视图
app.use(koaViews(join(__dirname, 'views'), {
    extension: 'pug'
}))

// 注册路由
app.use(router.routes()).use(router.allowedMethods())

app.listen(3000,() => {
    console.log('server running at port 3000')
})

// 创建管理员用户
{
    const User = require('./schema/userModel')
    const encrypt = require('./util/encrypt')
    
    User
        .find({username: 'admin'})
        .then(data => {
            if (data.length === 0) {
                new User({
                    username: 'admin',
                    password: encrypt('21232f297a57a5a743894a0e4a801fc3'), // 次密码为 admin 用md5加密后的字符窜
                    role: 666
                })
                    .save()
                    .then(() => {
                        console.log('管理员用户已创建， 用户名 -》admin，密码 -》admin')
                    })
                    .catch(() => {
                        console.log('创建管理员用户失败')
                    })
            } else {
                console.log('管理员用户已存在， 用户名 -》admin，密码 -》admin')
            }
        })
        .catch(() => {
            console.log('检查管理员用户失败')
        })


}
