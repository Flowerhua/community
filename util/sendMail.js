const nodeMailer = require('nodemailer')
const transporter = nodeMailer.createTransport({
    service: 'qq',
    auth: {
        user: 'chenyz.811@foxmail.com',
        pass: 'ezxxuhhvhctpecch'
    }
})

module.exports = function (toMail, content, title='注册验证') {

    let mailOptions = {
        from: 'chenyz.811@foxmail.com',
        to: toMail,
        subject: title,
        text: content
    }

    return new Promise((resolve, reject) => {
        transporter.sendMail(mailOptions, (err, data) => {
            if (err) return reject(err)
            resolve(data)
        })
    })
}