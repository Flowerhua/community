layui.use(['layedit','form','layer','element'], function () {
    var layedit = layui.layedit,
        form = layui.form,
        layer = layui.layer,
        $ = layui.$

    // 构建富文本编辑器
    var index = layedit.build('edit', {
        height: 300,
        hideTool: ['image']
    })

    // 监听提交事件
    form.on('submit(send)', function (data) {

        var content = layedit.getContent(index)
        
        if (content.trim().length === 0) {
            return layer.alert('请先输入内容')
        }

        var obj = {
            classify: data.field.classify,
            title: data.field.title,
            content: content
        }

        console.log(obj)
        
        $.post('/addArticle', obj, function (res) {
            if (res.status) {
                layer.alert(res.msg, function () {
                    window.location.href = '/'
                })
            } else {
                layer.alert(res.msg)
            }
        })

        return false
    })
})