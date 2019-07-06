const UserModel = require('../schema/userModel')
const encrypt = require('../util/encrypt')
const sendMail = require('../util/sendMail')
const randomCode = require('../util/randomCode')


// 渲染登陆或注册页面
exports.register = async (ctx) => {
    const isLogin = /login/.test(ctx.path) // 判断是登陆还是注册行为
    await ctx.render('register',{
        isLogin
    })
}

exports.code = async (ctx) => {
    // 生成随机数
    const code = randomCode()

}

// 用户注册处理函数
exports.reg = async (ctx) => {
    const { username, password } = ctx.request.body

    await new Promise((resolve, reject) => {
        UserModel.find({username}, (err, data) => {
            if (err) return reject(err)
            if (data.length) return resolve('')

            new UserModel({
                username,
                password: encrypt(password)
            })
                .save()
                .then((data) => {
                    resolve(data)
                })
                .catch((err) => {
                    reject(err)
                })
        })
    })
        .then((data) => {
            if (data) { // data为 往数据库储存的值或""

                ctx.body = {
                    status: 1,
                    msg: '注册成功'
                }
            } else {
                ctx.body = {
                    status: 0,
                    msg: '该用户名已存在'
                }
            }
        })
        .catch((err) => {
            console.log(err)
            ctx.body = {
                status: 0,
                msg: '服务器异常，请重试'
            }
        })

}

// 用户登陆处理函数
exports.login = async (ctx) => {
    const {username, password} = ctx.request.body


    await new Promise((resolve, reject) => {
        UserModel.find({username}, (err, data) => {

            if (err) return reject(err)
            if (data.length === 0) return resolve('')
            if (data[0].password !== encrypt(password)) return reject('')
            resolve(data)
        })
    })
        .then(data => {
            if (data) { // data为空字符串则用户名不存在

                // 保存cookie
                ctx.cookies.set('username', encodeURI(data[0].username), {
                    domain: 'localhost',
                    path: '/',
                    maxAge: 36e5,
                    httpOnly: false,
                    signed: true
                })
                ctx.cookies.set('uid', encodeURI(data[0]._id), {
                    domain: 'localhost',
                    path: '/',
                    maxAge: 36e5,
                    httpOnly: false,
                    signed: true
                })

                // 保存session
                ctx.session = {
                    username: data[0].username,
                    uid: data[0]._id,
                    avatar: data[0].avatar,
                    role: data[0].role
                }

                ctx.body = {
                    status: 1,
                    msg: '登陆成功'
                }

            } else {

                ctx.body = {
                    status: 0,
                    msg: '用户名不存在，请重新核对用户名'
                }
            }

        })
        .catch(err => {
            if (err) {
                ctx.body = {
                    status: 0,
                    msg: '服务器异常，请重试'
                }
            } else {
                ctx.body = {
                    status: 0,
                    msg: '密码错误，请重试'
                }
            }
        })

}

// 保持用户登陆
exports.keepLog = async (ctx, next) => {
    if (ctx.session.isNew) {
        console.log('keeplog -> session')
        if (ctx.cookies.get('username')) {
            console.log('keeplog -> cookie')
            ctx.session = {
                username: decodeURI(ctx.cookies.get('username')),
                uid: decodeURI(ctx.cookies.get('uid'))
            }
        }
    }
    await next()
}

// 用户退出
exports.logout = async (ctx) => {
    ctx.session = null
    ctx.cookies.set('username', null, {
        maxAge: 0
    })
    ctx.cookies.set('uid', null, {
        maxAge: 0
    })

    ctx.redirect('/')
}

// 上传头像
exports.uploadAvatar = async (ctx) => {

    const files = ctx.request.files

    if (files && files.file) {

        await UserModel
            .updateOne({_id: ctx.session.uid}, {
                $set: {
                    avatar: `/avatar/${ files.file.name }`
                }
            }, (err) => {
                if (err) {
                    ctx.body = {
                        status: 0,
                        msg: '上传失败，请重试'
                    }
                } else {

                    ctx.session.avatar = `/avatar/${ files.file.name }`

                    ctx.body = {
                        status: 1,
                        msg: '上传成功'
                    }
                }
            })

        
    } else {
        ctx.body = {
            status: 0,
            msg: '上传接口异常'
        }
    }

}