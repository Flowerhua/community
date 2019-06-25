layui.use(['element','laypage'], function () {
    var laypage = layui.laypage,
        $ = layui.$

    var maxNum = $('#laypage').data('maxnum')
    
    laypage.render({
        elem: 'laypage',
        count: maxNum,
        limit: 5,
        curr: location.pathname.replace('/page/', ''),
        jump: function (obj) {
            console.log(obj)

            var $a = $('#laypage a')


            $a.each(function () {

                var item = $(this)
                var page = item.data('page')

                item.prop('href', '/page/' + page)
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