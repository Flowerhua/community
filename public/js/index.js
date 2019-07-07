layui.use(['element','laypage'], function () {
    var laypage = layui.laypage,
        $ = layui.$

    // 导航栏点击切换颜色
    if (location.pathname.indexOf('/classify/') !== -1) {
        var select = location.pathname.split('/')[3]
        console.log(select)
        $('.'+select).css('color','red')
    }



    var $laypage = $('#laypage'),
        maxNum = $laypage.data('maxnum'),
        path = $laypage.data('path')

    

    laypage.render({
        elem: 'laypage',
        count: maxNum,
        limit: 5,
        curr: location.pathname.replace(path, ''),
        jump: function (obj) {
            var $a = $('#laypage a')

            $a.each(function () {

                var item = $(this)
                var page = item.data('page')
                item.prop('href', path + page)
            })

            if (obj.curr === 1) {
                $a.eq(0).prop('href', 'javascript:;')
            }
            console.log(obj.curr)
            console.log($a.length)
            if (obj.curr === (Math.ceil(maxNum / 5))) {
                $a.eq($a.length - 1).prop('href', 'javascript:;')
            }

        }
    })

})