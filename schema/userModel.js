const { db, Schema } = require('./connect')

const UserSchema = new Schema({

    username: String,
    password: String,
    email: String,
    avatar: {
        type: String,
        default: '/avatar/default.jpg'
    },
    articleNum: {
        type: Number,
        default: 0
    },
    commentNum: {
        type: Number,
        default: 0
    },
    role: {
        type: Number,
        default: 1
    }
},{
    versionKey: false,
    timestamps: {
        createdAt: 'created',
        updatedAt: 'updated'
    }
})

UserSchema.post('remove', (doc) => {
    const ArticleModel = require('./articleModel')
    const CommentModel = require('./commentModel')
    const { _id } = doc
    
    ArticleModel
        .find({author: _id})
        .then(data => {
            data.forEach(item => {
                item.remove()
            })
        })
        .catch(err => console.log(err))
    
    CommentModel
        .find({from: _id})
        .then(data => data.forEach(item => item.remove()))
        .catch(err => console.log(err))
    
    
})

const UserModel = db.model('users', UserSchema)

module.exports = UserModel