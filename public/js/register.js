
layui.use('form', function () {
    var form = layui.form,
        layer = layui.layer,
        $ = layui.$


    form.verify({
        username: [/^[a-zA-Z\d\u4e00-\u9fa5]{1,10}$/,"用户名必须是1-10位切不能有特殊字符"],
        password: [/^(\S){6,18}$/,"密码必须是6-18位切不能有空格"]
    })
    



    form.on("submit(login)", function (data) {
        
        var info = {
            username: data.field.username,
            password: md5(data.field.password)
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
            layer.msg('两次密码不一致！！！')
        } else {
            var info = {
                username: data.field.username,
                password: md5(data.field.password)
            }
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
                        title: false,
                        end: function () {
                            $('button[type=reset]')[0].click()
                        }


                    })
                }

            })
        }
        
        return false
    })
})