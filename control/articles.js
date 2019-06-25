const Article = require('../schema/articleModel')
const Comment = require('../schema/commentModel')
const User = require('../schema/userModel')

// 渲染首页
exports.index = async (ctx) => {
    let page = ctx.params.id || 1

    const limit = 5 //每页显示的数量

    // 总文档数
    const maxNum = await Article.estimatedDocumentCount((err, num) => err ? console.log(err) : num)

    if (page < 1 || page > Math.ceil(maxNum / limit)) {
        return await ctx.render('404', { title: '404' })
    }

    page --
    
    const artList = await Article
        .find()
        .sort('-created')
        .skip(limit * page)
        .limit(limit)
        .populate({
            path: 'author',
            select: '_id username avatar'
        })
        .then( data => data)
        .catch(err => console.log(err))


    await ctx.render('index',{
        title: "仿layui社区",
        session: ctx.session,
        artList,
        maxNum,
        path: '/page/'
    })
}

// 首页分类查询
exports.classify = async (ctx) => {
    const type = ctx.params.type
    const typeArr = ['html', 'javascript', 'angular', 'vue', 'react']


    if (!typeArr.includes(type)) {
        return ctx.render('404', {title: '404'})
    }

    const data = await Article
        .find({classify: type})
        .sort('-created')
        .populate({
            path: 'author',
            select: '_id username avatar'
        })
        .then( data => data)
        .catch(err => console.log(err))

    const maxNum = data.length
    const limit = 5 // 每次返回5条数据
    let page = ctx.params.page || 1

    if (page < 1 || (page > Math.ceil(maxNum / limit) && maxNum !== 0)) {
        return await ctx.render('404', { title: '404' })
    }
    page --
    let start = page * limit

    let artList

    if (start + limit <= maxNum) {
        artList = data.slice(start,start + limit)
    } else {
        artList = data.slice(start)
    }



    await ctx.render('index',{
        title: "仿layui社区",
        session: ctx.session,
        artList,
        maxNum,
        path: `/classify/${ type }/`
    })
}

// 渲染文章发表页
exports.addArticle = async (ctx) => {

    if (ctx.session.isNew) return ctx.redirect('/user/login')

    await ctx.render('layedit', {
        title: '发表文章'
    })
}

// 文章发表处理函数
exports.add = async (ctx) => {

    const data = ctx.request.body
    
    await new Article({
        ...data,
        author: ctx.session.uid
    })
        .save()
        .then(data => {

            ctx.body = {
                status: 1,
                msg: '发表成功'
            }

            User
                .updateOne({_id: data.author}, {
                    $inc: {
                        articleNum: 1
                    }
                }, (err) => {
                    if (err) console.log(err)
                })

        })
        .catch(() => {
            ctx.body = {
                status: 0,
                msg: '发表失败，请重试'
            }
        })

}

// 文章详情页
exports.detail = async (ctx) => {
    
    const id = ctx.params.id

    const _article = Article
        .findById(id)
        .populate('author', 'username _id')

    const _comment = Comment
        .find({article: id})
        .sort('-created')
        .populate('from', 'username avatar')

    const resultArr = await Promise.all([_article, _comment])
        .then(data => data)
        .catch(err => console.log(err))


    let [article, comments] = resultArr

    const comment = comments.map(item => {
        let o = {
            content: item.content,
            avatar: item.from.avatar,
            username: item.from.username,
            created: item.created
        }
        return o
    })

    await ctx.render('articleDetail', {
        session: ctx.session,
        title: article.title,
        article,
        comment
    })
}

// 提交评论处理函数
exports.saveComment = async (ctx) => {
    
    let message = {
        status: 0,
        msg: '只有登录后才能评论'
    }
    
    if (ctx.session.isNew) {
        return ctx.body = message
    }
    
    const data = ctx.request.body
    data.from = ctx.session.uid
    
    await new Comment(data)
        .save()
        .then((data) => {

            message = {
                status: 1,
                msg: '评论成功'
            }

            Article
                .updateOne({_id: data.article}, {
                    $inc: {
                        commentNum: 1
                    }
                }, (err) => {

                    if (err) console.log(err)
                })

            User
                .updateOne({_id: data.from}, {
                    $inc: {
                        commentNum: 1
                    }
                }, (err) => {
                    if (err) console.log(err)
                })


        })
        .catch((err) => {
            message.msg = '服务器异常，请重试'
            console.log(err)
        })

    ctx.body = message
}