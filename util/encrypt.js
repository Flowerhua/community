const crypto = require('crypto')

module.exports = function (password, key = '你很厉害我很佩服') {
    let hmac = crypto.createHmac('sha256',key)
    hmac.update(password)
    return hmac.digest('hex')
}