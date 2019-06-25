const {db, Schema} = require('./connect')
const ObjectId = Schema.Types.ObjectId

const ArticleSchema = new Schema({
    title: String,
    content: String,
    author: {
        type:ObjectId,
        ref: 'users'
    },
    classify: String,
    commentNum: {
        type: Number,
        default: 0
    }
},{
    versionKey: false,
    timestamps:{
        createdAt: 'created',
        updatedAt: 'updated'
    }
})


ArticleSchema.post('remove', (doc) => {
    const UserModel = require('./userModel')
    const CommentModel = require('./commentModel')

    const { _id: artId, author: authorId } = doc

    /*
        用户文章计数器-1
        删除所有评论
        评论用户对应的评论计数器减一
    */

    UserModel
        .updateOne({_id: authorId}, { $inc: { articleNum: -1 } })
        .exec(err => {
            if (err) console.log(err)
        })

    CommentModel
        .find({article: artId})
        .then(data => {
            data.forEach(item => item.remove())
        })
        .catch(err => console.log(err))


})




const ArticleModel = db.model('articles', ArticleSchema)

module.exports = ArticleModel