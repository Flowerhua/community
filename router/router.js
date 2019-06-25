const Router = require('koa-router')
const koaBody = require('koa-body')
const { join } = require('path')
const router = new Router

const users = require('../control/users')
const articles = require('../control/articles')
const admin = require('../control/admin')

const uploadConfig = {
    multipart: true,
    formidable: {
        // 上传路径
        uploadDir: join(__dirname,'../public/avatar'),
        // 保持文件后缀名1不变
        keepExtensions: true,
        // 最大上传字节
        maxFieldsSize: 1024 * 1024,
        // 上传前的回调，取文件后缀名 如.js .txt
        onFileBegin(name,file){

            let reg = /\.[a-zA-Z]+$/g
            let exc = file.name.match(reg)[0] //取后缀名
            let newName = Date.now() + exc
            file.name = newName
            file.path = join(__dirname,'../public/avatar/') + newName
        },
        onError(err){
            console.log(err)
        }
    }
}

router.get('/', articles.index)

// 文章列表分页查询路由
router.get('/page/:id', articles.index)

// 首页分类查询
router.get('/classify/:type', articles.classify)
router.get('/classify/:type/:page', articles.classify)

// 处理用户登陆或注册，渲染对应模板
router.get(/^\/user\/(login|reg)$/, users.register)

// 用户注册处理函数
router.post('/user/reg', users.reg)

// 用户登陆处理函数
router.post('/user/login', users.login)

// 用户退出
router.get('/user/logout', users.logout)

// 文章发表页面
router.get('/addArticle', articles.addArticle)

// 文章发表处理函数
router.post('/addArticle', articles.add)

// 文章详情页
router.get('/article/:id',articles.detail)

// 提交评论
router.post('/comment', articles.saveComment)

// 后台管理页面
router.get('/admin/:id', admin.index)

// 用户头像上传
router.post('/upload/avatar', koaBody(uploadConfig),users.uploadAvatar)

// 后台显示评论
router.get('/backstage/comment', admin.comment)

// 后台显示文章
router.get('/backstage/article', admin.article)

// 后台显示用户
router.get('/backstage/user', admin.user)

// 后台删除评论
router.del('/comment/:id', admin.delComment)

// 后台删除文章
router.del('/article/:id', admin.delArticle)

// 后台删除用户
router.del('/user/:id', admin.delUser)

// 404页面
router.get('*', async (ctx) => {
    await ctx.render('404', { title: '404' })
})


module.exports = router