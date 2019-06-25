layui.use(['element','laypage'], function () {
    var laypage = layui.laypage,
        $ = layui.$

    // 导航栏点击切换颜色
    if (location.pathname.indexOf('classify') !== -1) {
        var select = location.pathname.replace('/classify/','')
        $('.'+select).css('color','#f60')
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
            if (obj.curr === $a.length - 1) {
                $a.eq($a.length - 1).prop('href', 'javascript:;')
            }
        }
    })

})