const UserModel = require('../schema/userModel')
const encrypt = require('../util/encrypt')
const sendMail = require('../util/sendMail')
const randomCode = require('../util/randomCode')


// 渲染登陆或注册页面
exports.register = async (ctx) => {
    const isLogin = /login/.test(ctx.path) // 判断是登陆还是注册行为
    await ctx.render('register',{
        title: isLogin ? '登陆' : '注册',
        isLogin,
    })
}

const _code = {}; // 用于存放验证码
const _codeHash = {} // 用于存放验证码请求的客户端ip
const _regHash = {} // 用于存放注册请求的客户端ip

exports.code = async (ctx) => {
    const ip = ctx.ip

    if (_codeHash[ip]) {
        return ctx.body = {
            status: 0,
            msg: '您操作的太频繁了'
        }
    }
    _codeHash[ip] = true
    setTimeout(() => {
        delete _codeHash[ip]
    },30000)

    const email = ctx.query.email
    // 验证query参数防止恶意请求
    if (!/^([a-zA-Z]|[0-9])(\w|\-)+@[a-zA-Z0-9]+\.([a-zA-Z]{2,4})$/.test(email)) {
        return ctx.body = {
            status: 0,
            msg: '邮箱格式不正确'
        }
    }

    // 储存验证码
    let code = randomCode()
    _code[ctx.ip] = [code,email]

    await sendMail(email,`本次注册的验证码为\n${ code }\n有效时间为5分钟，若不是本人操作请忽视`)
        .then(() => {
            ctx.body = {
                status: 1,
                msg: '验证码已发送，有效时间5分钟'
            }
        })
        .catch(() => {
            ctx.body = {
                status: 0,
                msg: '验证码发送失败'
            }
        })

    // 5分钟后删除验证码
    setTimeout(() => {
        delete _code[ip]
    },1000*60*5)

}

// 用户注册处理函数
exports.reg = async (ctx) => {
    let result = {
        status: 0,
        msg: '验证码错误或已过期'
    }

    const ip = ctx.ip
    // 防止频繁请求
    if (_regHash[ip]) { // hash[ip]有值则说明30秒内访问过
        result.msg = '您操作的太频繁了，请稍后再试'
        return result
    }
    _regHash[ip] = true
    setTimeout(() => {
        delete _regHash[ip]
    },30000)



    const { username, password, email, code } = ctx.request.body

    if (Number(code) !== _code[ip][0]) return ctx.body = result
    if (email !== _code[ip][1]) return ctx.body = {status:0, msg:'邮箱不正确'}

    await new Promise((resolve, reject) => {
        UserModel.find({username}, (err, data) => {
            if (err) return reject(err)
            if (data.length) return resolve('')

            new UserModel({
                username,
                email,
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
        .catch(() => {
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
                    httpOnly: true,
                    signed: true
                })
                ctx.cookies.set('uid', encodeURI(data[0]._id), {
                    domain: 'localhost',
                    path: '/',
                    maxAge: 36e5,
                    httpOnly: true,
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