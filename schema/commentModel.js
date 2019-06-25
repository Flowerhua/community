const {db, Schema} = require('./connect')
const ObjectId = Schema.Types.ObjectId

const CommentSchema = new Schema({

    content: String,
    from: {
        type: ObjectId,
        ref: 'users'
    },
    article: {
        type: ObjectId,
        ref: 'articles'
    }

},{
    versionKey: false,
    timestamps: {
        createdAt: 'created',
        updatedAt: 'upadred'
    }
})


CommentSchema.post('remove', (doc) => {
    const UserModel = require('./userModel')
    const ArticleModel = require('./articleModel')

    const { article: artId, from: userId } = doc

    // 更新用户的评论计数器
    ArticleModel
        .updateOne({_id: artId}, { $inc: { commentNum: -1 } })
        .exec(err => {
            if (err) console.log(err)
        })

    // 更新文章的评论计数器
    UserModel
        .updateOne({ _id: userId }, { $inc: { commentNum: -1 } })
        .exec(err => {
            if (err) console.log(err)
        })

})



const CommentModel = db.model('comments', CommentSchema)

module.exports = CommentModel