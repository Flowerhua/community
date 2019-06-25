layui.use(['element','layedit','form','layer'], function () {
    var layedit = layui.layedit,
        form = layui.form,
        layer = layui.layer,
        $ = layui.$

    var idx = layedit.build('layedit', {
        tool: ['face']
    })
    
    form.on('submit', function () {
        var content = layedit.getText(idx).trim()

        if (content.length === 0) return layer.msg('请先输入评论内容')
        
        var data = {
            content: layedit.getContent(idx),
            article: $('h1.title').data('artId')
        }

        $.post('/comment', data, function (res) {
            if (res.status) {
                layer.open({
                    title: false,
                    content: res.msg,
                    icon: 1,
                    end: function () {
                        window.location.reload()
                    }
                })
            } else {
                layer.open({
                    title: false,
                    content: res.msg,
                    icon: 0
                })
            }
        })
    })


})