
layui.use(['form','element'], function () {
    var form = layui.form,
        layer = layui.layer,
        $ = layui.$

    var flag = true

    $('#getcode').click(function () {

        if (!flag) return



        var email = $('input[name=email]').val()
        if (/^([a-zA-Z]|[0-9])(\w|\-)+@[a-zA-Z0-9]+\.([a-zA-Z]{2,4})$/.test(email)) {
            flag = false
            var that = this
            $(that).text('').addClass('layui-icon layui-icon-loading')


            $.get('/user/reg/code',{email: email}, function (res) {
                if (res.status) {
                    $(that).removeClass('layui-icon').removeClass('layui-icon-loading').addClass('layui-btn-disabled').text('30秒后可重试')
                    var time = 30
                    var timer = setInterval(function () {
                        if (time === 0) {
                            clearInterval(timer)
                            $(that).removeClass('layui-btn-disabled').text('获取验证码')
                            flag = true
                            return
                        }
                        $(that).text(--time + '秒后可重试')
                    },1000)
                }

                layer.msg(res.msg)

            })

        } else {
            layer.msg('邮箱格式不正确')
        }

    })

    form.verify({
        username: [/^[a-zA-Z\d\u4e00-\u9fa5]{1,10}$/,"用户名必须是1-10位切不能有特殊字符"],
        password: [/^(\S){6,18}$/,"密码必须是6-18位切不能有空格"],
        email: [/^([a-zA-Z]|[0-9])(\w|\-)+@[a-zA-Z0-9]+\.([a-zA-Z]{2,4})$/,"邮箱格式不正确"]
    })




    form.on("submit(login)", function (data) {
        
        var info = {
            username: data.field.username,
            password: md5(data.field.password),
        }

        $.post('/user/login', info, function (res) {

            console.log(res)
            if (res.status) {
                window.location.href = '/'
            } else {
                layer.open({
                    icon: 2,
                    title: false,
                    content: res.msg
                })
            }

        })

        return false
    })
    

    
    form.on("submit(reg)", function (data) {

        if (data.field.confirmPwd !== data.field.password) {
            return layer.msg('两次密码不一致！！！')
        }

        var info = {
            username: data.field.username,
            password: md5(data.field.password),
            email: data.field.email,
            code: data.field.code
        }
        console.log(typeof info.code)

        $.post('/user/reg', info , function (res) {
            if (res.status) {
                layer.open({
                    content: res.msg + ',即将跳转到登陆页面',
                    title: false,
                    icon: 1,
                    end: function () {
                        window.location.href = '/user/login'
                    }
                })
            } else {
                layer.open({
                    content: res.msg,
                    icon: 2,
                    title: false

                })
            }

        })

        return false
    })
})