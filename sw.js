(function (global) {
    "use strict";

    global.CONFIG = {
        DISABLE:false,
        DEBUG: true,
        VERSION: "0.0.23v20170519",
        APP_NAME: 'JD',
        PAGE_OFFLINE: '/offline.html'
    };

    /**
     * 安装策略：初始化基础业务线缓存用于引发请求产生浏览器缓存而service worker 使用策略时并不读取, 目的是解决每次发版所有业务线缓存丢失的问题。
     * @type {[*]}
     * @use 基础脚本，首页，单品页，购物车，结算页，秒杀商品，类目页面
     */
    global.cacheForStatic = [
        '//st-en.jd.com/st-m/dist/v20170519/base-min.css',
        '//st-en.jd.com/st-m/dist/v20170519/base-min.js',
        '//st-en.jd.com/st-m/dist/v20170519/home-min.css',
        '//st-en.jd.com/st-m/dist/v20170519/home-min.js',
        '//st-en.jd.com/st-m/dist/v20170519/superDeal-min.css',
        '//st-en.jd.com/st-m/dist/v20170519/superDeal-min.js',
        '//st-en.jd.com/st-m/dist/v20170519/category-min.css',
        '//st-en.jd.com/st-m/dist/v20170519/category-min.js',
        '//st-en.jd.com/st-m/dist/v20170519/product-min.css',
        '//st-en.jd.com/st-m/dist/v20170519/productNew-min.js',
        '//st-en.jd.com/st-m/dist/v20170519/cart-min.css',
        '//st-en.jd.com/st-m/dist/v20170519/cart-min.js',
        '//st-en.jd.com/st-m/dist/v20170519/fillOrder-min.css',
        '//st-en.jd.com/st-m/dist/v20170519/fillOrder-min.js',
        '//st-en.jd.com/st-m/dist/v20170519/i/i-goback.png'
    ];

    global.cacheForBasic = ['/','/category/all'];//.concat(CONFIG.PAGE_OFFLINE);

    //self.importScripts('//st-en.jd.com/st-m/pwa/sw-toolbox/sw-toolbox.js');
    //self.importScripts('//st-en.jd.com/st-m/pwa/strategies/strategies.js');
    global.importScripts('//st-en.jd.com/st-m/pwa/sw-toolbox.js');
    global.importScripts('//st-en.jd.com/st-m/pwa/strategies.js');

}(self));