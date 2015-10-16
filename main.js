var g$url = 'http://api.meizhanggui.cc/Wenshen/V3.0.0/';
//var g$url = 'http://123.57.42.13/Wenshen/V3.0.0/';

var g$cid = location.search.substr(1).match(/_id=([^\b&]*)/)[1];//获取店铺id

var ex = {
    jsonp: function (obj, pageObj) {
        $.jsonp({
            url: obj.url,
            callbackParameter: obj.callbackParameter ? obj.callbackParameter : "callback",
            data: obj.data ? obj.data : null,
            success: obj.success,
            error: obj.error ? obj.error : function () {
                layer.msg('您的网络连接不太顺畅哦!');
            },
            beforeSend: obj.beforeSend ? obj.beforeSend : function () {
            },
            complete: obj.complete ? obj.complete : function () {
            }
        })
    },
    template: {},
    data: {
        list: []
    }
};

var config = {
    isMobile: navigator.userAgent.match(/mobile/i) != null,
    isWX: navigator.userAgent.match(/MicroMessenger/i) != null,
    isIOS: navigator.userAgent.match(/iPhone/i) || navigator.userAgent.match(/iPad/i) != null
};

var comment = {
    list:[],
    totalNum:-1,
    isLoading: false,
    loadingStart: function () {
        comment.isLoading = true;
        $('.more').text('正在加载中...');
        ex.jsonp({
            url:g$url + 'Comment/Commodity/list?_method=GET',
            data:{
                _id:g$cid,
                index:ex.data.list.length,
                limit:6
            },
            success:function(obj){
                obj = $.parseJSON(obj);
                console.log('\n拉取评论列表');
                console.dir(obj);
                comment.list = comment.list.concat(obj.data.list);
                $('div.comment').html(ex.template.list.render(comment));
                comment.isLoading = false;
                $('.more').text('更多');
                if(comment.list.length>=comment.totalNum)$('.more').hide();
            }
        })
    },
    init:function(){
        $('div.comment').html(ex.template.list.render(comment));
        $('.more').text('更多');
        if(comment.list.length>=comment.totalNum)$('.more').hide();
    }
};

function download() {
    var HREF = {
        wx: 'http://a.app.qq.com/o/simple.jsp?pkgname=com.weimi.mzg.ws',
        ios: 'https://itunes.apple.com/cn/app/wen-shen-da-ka-zui-hao-wen/id1022212399?mt=8',
        adr: 'http://a.app.qq.com/o/simple.jsp?pkgname=com.weimi.mzg.ws'
    };

    if (config.isWX) {
        location.href = HREF.wx;
    }
    else if (config.isIOS) {
        location.href = HREF.ios;
    }
    else {
        location.href = HREF.adr;
    }
}

juicer.register('transTimeStamp', function (unixtime) {
    var str, todayStr = new Date(),
        todayUnixTime = Date.parse(todayStr.toString().replace(/ \d{1,2}:\d{1,2}:\d{1,2} /, ' 00:00:00 ')),
        nowUnixTime = Date.parse(todayStr),
        timeDiff = Math.ceil((nowUnixTime - unixtime) / 1000),
        todayTimeDiff = Math.ceil((todayUnixTime - unixtime) / 1000);
    if (timeDiff > 3600 * 120) {
        var curDate = new Date(unixtime);
        str = (curDate.getMonth() + 1) + '-' + curDate.getDate() + ' ' + curDate.getHours() + ':' + curDate.getMinutes();
    } else if (timeDiff > 3600 * 24) {
        str = Math.ceil(timeDiff / 86400) + "天前 ";
    } else {
        if (timeDiff > 3600) {
            str = Math.floor(timeDiff / 3600) + "小时前 ";
        } else if (timeDiff > 60) {
            str = Math.floor(timeDiff / 60) + "分钟前 ";
        } else {
            str = "刚刚";
        }
    }
    return str;
});

(function () {
    if (config.isMobile)$('head').append('<meta name="viewport" content="width=device-width,initial-scale=1.0, minimum-scale=1.0, maximum-scale=1.0, user-scalable=no">');

    //拉取评论列表
    ex.jsonp({
        url:g$url + 'Comment/Commodity/list?_method=GET',
        data:{
            _id:g$cid,
            index:0,
            limit:1
        },
        success:function(obj){
            obj = $.parseJSON(obj);
            console.log('\n拉取评论列表');
            console.dir(obj);
            comment.list = comment.list.concat(obj.data.list);
            comment.totalNum = obj.data.totalNum;
            comment.isLoading = false;
            if(ex.data.id&&ex.template.main)comment.init();
        }
    });
    //拉取商品详情
    ex.jsonp({
        url: g$url + 'Commodity/info?_method=GET',
        data: {
            _id: g$cid,
            store: true
        },
        success: function (obj) {
            obj = $.parseJSON(obj);
            console.log('\n拉取商品详情');
            console.dir(obj);

            var commodityInfo = obj.data.commodityInfo;
            var storeInfo = obj.data.commodityInfo.storeInfo;

            ex.data = {
                id: commodityInfo._id,
                title: commodityInfo.title,
                images: commodityInfo.images,
                description: commodityInfo.description,
                price: commodityInfo.price,
                tags: commodityInfo.tag ? commodityInfo.tag.split('#') : [],

                avatar: storeInfo.avatar,
                nickname: storeInfo.nickname,
                address: storeInfo.company ? storeInfo.company.address : null,
                score: storeInfo.score,
                storeCommentNum: storeInfo.storeCommentNum
            };

            if(ex.template.main)init();
            if(comment.totalNum>=0)comment.init();
        }
    });
})();

$(document).ready(function () {
    ex.template.main = juicer($('#mainTemp').remove().html());
    ex.template.list = juicer($('#listTemp').remove().html());
    if (ex.data.id)init();
});

window.addEventListener('load', function () {
    FastClick.attach(document.body);
}, false);

function init() {
    var i, star = [];
    $('#main').html(ex.template.main.render(ex.data));
    for (i = 0; i < 5; i++) {
        star[i] = ex.data.score;
        ex.data.score--;
        $('.star.light').each(function (index) {
            var w, s = star[index];
            if (s > 0.95)w = 20;
            else if (s < 0.05)w = 0;
            else w = (s * 0.8 + 0.1) * 20;
            $(this).css('width', w);
        })
    }
    $('#loading').hide();
    if (ex.data.list)$('ul.comment').html(ex.template.list.render(ex.data));
    $('.more').click(function(){
        list.loadingStart();
    });
    $('footer').click(function(){
        download();
    });
    $('.adv').click(function(){
        download();
    })
}