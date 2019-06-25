const Article = require('../schema/articleModel')
const Comment = require('../schema/commentModel')
const User = require('../schema/userModel')
const fs = require('fs')
const { join } = require('path')


// 后台页面渲染
exports.index = async (ctx) => {
    if (ctx.session.isNew) return ctx.redirect('/user/login')

    const id = ctx.params.id

    // 读取 views/admin 文件夹下的所有页面，根据动态路由作对比，匹配上就显示对应的页面，没匹配上就返回404
    const dirArr = fs.readdirSync(join(__dirname,'../views/admin'))
    let flag = false

    for (let i = 0, len = dirArr.length; i < len; i++) {
        let filename = dirArr[i]
        if (filename.replace(/^admin-|\.pug$/g, '') === id) {
            flag = true
            break
        }
    }

    if (flag) {
        await ctx.render(`admin/admin-${ id }`, {
            title: '个人中心',
            session: ctx.session
        })
    } else {
        await ctx.render('404', {
            title: '404'
        })
    }

}

// 后台评论表格数据
exports.comment = async (ctx) => {
    if (ctx.session.isNew) return ctx.redirect('/user/login')

    const id = ctx.session.uid

    const _data = await Comment
        .find({from: id})
        .sort('-created')
        .populate('article', 'title _id')
        .then(data => data)
        .catch(err => console.log(err))

    // 对从数据库查询到的数据进行二次处理后返回给客户端
    const data = _data.map((item) => {
        let o = {
            title: item.article.title,
            articleId: item.article._id,
            userId: item.from,
            content: item.content,
            created: item.created.toLocaleString(),
            id: item._id
        }
        return o
    })

    ctx.body = {
        code: 0,
        msg: "",
        count: data.length,
        data
    }

}

// 后台文章表格数据
exports.article = async (ctx) => {
    if (ctx.session.isNew) return ctx.redirect('/user/login')
    
    const id = ctx.session.uid
    
    const _data = await Article
        .find({author: id})
        .sort('-created')
        .then(data => data)
        .catch(err => console.log(err))

    const data = _data.map((item) => {
        let o = {
            id: item._id,
            title: item.title,
            classify: item.classify,
            commentNum: item.commentNum,
            created: item.created.toLocaleString()
        }
        return o
    })

    ctx.body = {
        code: 0,
        msg: "",
        count: data.length,
        data
    }

}

// 后台用户表格数据
exports.user = async (ctx) => {
    if (ctx.session.isNew) return ctx.redirect('/user/login')

    const _data = await User
        .find()
        .then(data => data)
        .catch(err => console.log(err))

    _data.shift()

    const data = _data.map((item) => {
        let o = {
            id: item._id,
            username: item.username,
            role: item.role,
            commentNum: item.commentNum,
            articleNum: item.articleNum,
            created: item.created.toLocaleString()
        }
        return o
    })

    ctx.body = {
        code: 0,
        msg: "",
        count: data.length,
        data
    }
}

// 后台删除评论
exports.delComment = async (ctx) => {
    if (ctx.session.isNew) return ctx.body = "Error"

    const _id = ctx.params.id // 文章_id

    await Comment
        .findById(_id)
        .then((data) => {
            data.remove() // 使用Schema实例方法进行删除从而触发 Schema 的 post 钩子函数

            ctx.body = {
                status: 1
            }
        })
        .catch(err => {
            console.log(err)
            ctx.body = {
                status: 0
            }
        })

}

// 后台删除文章
exports.delArticle = async (ctx) => {

    if (ctx.session.isNew) return ctx.body = 'Error'

    const _id = ctx.params.id // 要删除文章的_id

    await Article
        .findById(_id)
        .then(data => {
            data.remove()
            ctx.body = {
                status: 1
            }
        })
        .catch(() => {
            ctx.body = {
                status: 0
            }
        })

}

// 后台删除用户
exports.delUser = async (ctx) => {
    const id = ctx.params.id

    await User
        .findById(id)
        .then(data => {
            data.remove()
            ctx.body = {
                status: 1
            }
        })
        .catch(err => {
            console.log(err)
            ctx.body = {
                status: 0
            }
        })



}