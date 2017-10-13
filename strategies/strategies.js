/**
 * @Created by cdlanxingxing@jd.com on 2017/5/4.
 * @Use 策略管理器（安装策略、使用策略）
 */
(function (global, toolbox) {

    var tools = {
        requestAccepts: function (request, contentType) {
            return request.headers.get('Accept').indexOf(contentType) != -1;
        },
        isMIndex: function (url) {
            url = url.split('?')[0];//.replace(/^\s+$/gi,"").replace(/\s+$/gi,"");
            url = url.split('#')[0];//.replace(/^\s+$/gi,"").replace(/\s+$/gi,"");
            var reg = new RegExp("^(https:|http:)?//(m.jd.ru|m.joybuy.com)(|/+|/+index(|/+|[.][^./]{1,}))$", "gi");
            return reg.test(url)
        },
        isImage: function (url) {
            return /.(png|jpg|jpeg|gif|webp|bmp)$/gi.test(url);
        },
        isJdPicServer: function (url) {
            return /^((http(s|):\/\/)|(\/\/))((img([0-9]{2}|.360buyimg).jd.id)|(img([0-9]{2}).360buyimg.com))\//gi.test(url);
        },
        isProduct: function (url) {
            //return  new RegExp('^('+self.location.origin+'\/product\/).','gi').test(url);
            return /^https:\/\/(m.jd.ru|m.joybuy.com)\/((ware\/detail\/(\d+))|((|product\/(|(.*_)))(\d+).html))/gi.test( url );
        }
    };
    var TYPE = {
        REQUEST:{
            MODE:{ NO_CORS:'no-cors'/*png,style.script*/, CORS:'cors'/*ajax*/, NAVIGATE:'navigate'/*浏览器地址栏访问*/ }
        }
    };

    var CONFIG = global['CONFIG'] || {};
    CONFIG.OFFLINE_PAGE = CONFIG.OFFLINE_PAGE || CONFIG.PAGE_OFFLINE;
    CONFIG.OFFLINE_IMG = '';
    CONFIG.ORIGIN=self.location.origin;
    CONFIG.CACHE_STATIC = CONFIG.APP_NAME + ':' + CONFIG.VERSION + ':STATIC';
    CONFIG.CACHE_BASIC = CONFIG.APP_NAME + ':' + CONFIG.VERSION + ':BASIC';
    //CONFIG.CACHE_BASIC_COS = CONFIG.APP_NAME + ':' + CONFIG.VERSION + ':BASIC:COS'; //异步接口
    CONFIG.CACHE_BASIC_PRODUCT = CONFIG.APP_NAME + ':' + CONFIG.VERSION + ':BASIC:PRODUCT';
    CONFIG.CACHE_BASIC_SEARCH = CONFIG.APP_NAME + ':' + CONFIG.VERSION + ':BASIC:SEARCH';
    CONFIG.CACHE_BASIC_CATEGORY = CONFIG.APP_NAME + ':' + CONFIG.VERSION + ':BASIC:CATEGORY';

    console.log(CONFIG);



    toolbox.options.debug = CONFIG.DEBUG;

    //toolbox.precache(cacheForBasic.concat(cacheForStatic));

    self.addEventListener('activate', function (event) {
        //remove cache
        //event.waitUntil(
        caches.keys().then(function (cacheNames) {
            return Promise.all(
                cacheNames.map(function (cacheName) {
                    if (cacheName.indexOf(CONFIG.VERSION) < 0) {
                        console.info('delete cache', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
        //);

        // Claim 将worker激活，让所有符合这个worker域的客户触发'oncontrollerchange'事件
        //immediately claim the currently connected clients
        return self.clients.claim();
    });

    self.addEventListener('install', function (event) {
        // Perform install steps
        console.info('install-caches');
        console.time('install');

        caches.open(CONFIG.CACHE_STATIC).then(function (cache) {
            console.log('Opened cache');
            return cache.addAll(cacheForStatic).then(function () {
                console.timeEnd('install');
            });
            //缓存跨域文件且文件不支持跨域防止失败
            // return cache.addAll(urlsToCache.map(function (url) {
            //     return new Request(url,{mode:'no-cors'});
            // })).then(function () {
            //     console.log('All resources have been fetched and cached.');
            //     console.timeEnd('install');
            // });
        });

        caches.open(CONFIG.CACHE_BASIC).then(function (cache) {
            return cache.addAll(cacheForBasic);
        });

        event.waitUntil(
            caches.open(CONFIG.CACHE_BASIC).then(function (cache) {
                return cache.add(CONFIG.PAGE_OFFLINE).then(function () {
                    // skipWating 促使等待中的ServiceWorker被激活，触发'onactivat'事件
                    // 和clients.claim()一起运用能够让ServiceWorker在客户端马上生效
                    self.skipWaiting();
                });
            })
        );
    });

    // self.addEventListener("install", function (event) {
    //     event.waitUntil(self.skipWaiting())
    // });
    // self.addEventListener("activate", function (event) {
    //     event.waitUntil(self.clients.claim().then(cleanCache))
    // });
    // self.addEventListener("error", function (event) { });
    // function cleanCache() {
    //     var prefixRegexp = new RegExp(CONFIG.APP_NAME, "i");
    //     var versionRegexp = new RegExp(CONFIG.VERSION, "i");
    //     return caches.keys().then(function (cacheNames) {
    //         return Promise.all(cacheNames.filter(function (cacheName) {
    //             return prefixRegexp.test(cacheName) && !versionRegexp.test(cacheName)
    //         }).map(function (cacheName) {
    //             return caches.delete(cacheName)
    //         }))
    //     })
    // }

    // self.addEventListener('install', function(event) {
    //     event.waitUntil(self.skipWaiting());
    // });
    // self.addEventListener('activate', function(event) {
    //     return self.clients.claim();
    // });
    // global.clearCache = function clearCache() {
    //     return caches.keys().then(function (cacheNames) {
    //         return Promise.all(
    //             cacheNames.map(function (cacheName) {
    //                 return caches.delete(cacheName);
    //             })
    //         );
    //     });
    // }
    // global.clearCache();


    if(CONFIG.DISABLE === true) {
        //self.addEventListener('activate',function () { self.clients.claim(); });
        //self.addEventListener('install',function(){ self.skipWaiting(); });
        return;
    };


    self.addEventListener('fetch', function (event) {
        if (event.request.method !== 'GET') return;

        var request = event.request;
        var url = event.request.url;

        if(url.indexOf(self.location.origin) === 0 ){
            if (request.mode === 'navigate'){ //浏览器地址栏访问 //Network First
                // if(tools.isMIndex(url)){
                //     event.respondWith(
                //         fetch(request.clone()).then(function (response) {
                //             if (!response && response.status !== 200) return response;
                //             var responseToCache = response.clone();
                //             caches.open(CONFIG.CACHE_BASIC).then(function (cache) { cache.put('/',  responseToCache); });
                //             return response;
                //         }).catch(function () {
                //             return caches.open(CONFIG.CACHE_BASIC).then(function (cache){
                //                 return cache.match('/').then(function (response) {
                //                     if (response) return response;
                //                     return cache.match(CONFIG.PAGE_OFFLINE);
                //                 });
                //             });
                //         })
                //     );
                // }

                // else if(tools.isProduct(url)){
                //     event.respondWith(
                //         fetch(request.clone()).then(function (response) {
                //             if (!response && response.status !== 200/* || response.type !== 'basic'*/) return response;
                //             var responseToCache = response.clone();
                //             caches.open(CONFIG.CACHE_BASIC_PRODUCT).then(function (cache) { cache.put( request, responseToCache ); });
                //             return response;
                //         }).catch(function () {
                //             return caches.open(CONFIG.CACHE_BASIC_PRODUCT).then(function (cache){
                //                 return cache.match(request).then(function (response) {
                //                     if (response) return response;
                //                     return caches.open(CONFIG.CACHE_BASIC).then(function (cache) { return cache.match(CONFIG.OFFLINE_PAGE); });
                //                 });
                //             });
                //         })
                //     );
                // }

                // else if(new RegExp('^'+CONFIG.ORIGIN+'/category/all','gi').test(url)){
                //     event.respondWith(
                //         fetch(request).then(function (response) {
                //             if (!response && response.status !== 200/* || response.type !== 'basic'*/) return response;
                //             var responseToCache = response.clone();
                //             caches.open(CONFIG.CACHE_BASIC).then(function (cache) { cache.put(request, responseToCache); });
                //             return response;
                //         }).catch(function () {
                //             return caches.open(CONFIG.CACHE_BASIC).then(function (cache){
                //                 return cache.match(request).then(function (response) {
                //                     if (response) return response;
                //                     return cache.match(CONFIG.PAGE_OFFLINE);
                //                 });
                //             });
                //         })
                //     );
                // }

                //else{
                    event.respondWith(
                        fetch(request.clone()/*,{credentials: 'include'}*/).catch(function () {
                            return caches.open(CONFIG.CACHE_BASIC).then(function (cache) {
                                console.info('----------------offline_page-----------');
                                return cache.match(CONFIG.OFFLINE_PAGE);
                            });
                        })
                    );
                //}
            }
            // else{
            //     //request.mode in (no-cors,cors)可能是异步或者可能是内嵌资源等等之类的请求
            //     //类目页面部分接口
            //     if((new RegExp(/^https:\/\/(m.joybuy.com|m.jd.ru)\/category\/child/gi)).test(url)){
            //         event.respondWith(
            //             fetch(request.clone()).then(function (response) {
            //                 if (!response && response.status !== 200) return response;
            //                 var responseToCache = response.clone();
            //                 caches.open(CONFIG.CACHE_BASIC_CATEGORY).then(function (cache) { cache.put(request, responseToCache); });
            //                 return response;
            //             }).catch(function () {
            //                 return caches.open(CONFIG.CACHE_BASIC_CATEGORY).then(function (cache) {
            //                     return cache.match(request).then(function(response){ if(response) return response });
            //                 });
            //             })
            //         );
            //     }
            // }
        }

        // else if(/^https:\/\/st-en.jd.com\/st-m\//gi.test(url)){//由于静态资源效应的本地缓存时间写的是1000天
        //     event.respondWith(
        //         fetch(request.clone())
        //             .catch(function () {
        //                 return caches.open(CONFIG.CACHE_STATIC).then(function (cache) {
        //                     return cache.match(request).then(function (response){
        //                         if (response) {
        //                             //console.log('cache:', event.request);
        //                             return response;
        //                         }
        //                     });
        //                 })
        //             })
        //     );
        // }
        //else{
            // if(tools.isJdPicServer(url)) return;
        //}
    });



    function log() {
        CONFIG.DEBUG && console.log.apply(console, ['%c%o', 'color:#0f0'].concat([].slice.call(arguments)));
    }
    function error() {
        CONFIG.DEBUG && console.log.apply(console, ['%c%o', 'color:#f00'].concat([].slice.call(arguments)));
    }
    function proxy(method, fn) {
        return function(request, values, options) {
            log('Cache Strategy:', method && method.name || 'custom', '[' + request.url + ']');
            return fn.call(null, request, values, options, method);
        }
    }

    /**
     * 查找离线页面
     * @param request
     * @returns {*}
     */
    function fallback(request) {
        log('[ERROR]:use fallback!');
        if (request.method === 'GET') {
            var headers = request.headers.get('accept');
            if (headers.includes('text/html')) {
                return caches.open(CONFIG.CACHE_BASIC).then(function (cache) {
                    return cache.match(new Request(CONFIG.OFFLINE_PAGE))
                })
            }
            // else if (headers.includes('image')) {
            //     return toolbox.cacheOnly(new Request(CONFIG.OFFLINE_IMG), null, toolbox.options);
            // }
        }
    }

    function defaultHandler(request, values, options, method) {
        return method.apply(null, arguments).catch(function() {
            error('[ERROR]: load :' + request.url + ' error');
            return fallback(request, values, options);
        })
    }

    function resHandler(request, values, options, method) {
        // if (request.url.indexOf('?t=') === -1) {
        //     method = toolbox.fastest;
        //     options.maxAgeSeconds = 60 * 30;
        // } else {
             //options.maxAgeSeconds = 60 * 60 * 24 * 30; //30天 写这里不会生效
        // }
        return method.apply(null, arguments).catch(function() {
            error('[ERROR]:load res:' + request.url + ' error');
        });
    }

    /*静态资源路由*/
    toolbox.router.get('/(.*)', proxy(toolbox.cacheFirst, resHandler), {
        cache: {
            name: CONFIG.CACHE_STATIC
        },
        successResponses: /^0|([12]\d\d)$/,
        origin: /^https:\/\/st-en.jd.com$/
    });

    /*搜索结果业务线*/
    toolbox.router.get('/search/result/list(.*)', proxy(toolbox.fastest, defaultHandler), {
        cache: {
            name: CONFIG.CACHE_BASIC_SEARCH,
            maxAgeSeconds:60 * 60 * 10, //缓存10分钟
            maxEntries:50,
        },
        successResponses: /^0|([12]\d\d)$/,
        origin:new RegExp('^'+CONFIG.ORIGIN+'$')
    });

    /*类目业务线*/
    toolbox.router.get('category/all(.*)', proxy(toolbox.fastest, defaultHandler), {
        cache: {
            name: CONFIG.CACHE_BASIC_CATEGORY,
            maxAgeSeconds:60 * 60 * 10, //缓存10分钟
            //maxEntries:50,
        },
        successResponses: /^0|([12]\d\d)$/,
        origin:new RegExp('^'+CONFIG.ORIGIN+'$')
    });
    toolbox.router.get('category/child(.*)', toolbox.fastest, {
        cache: {
            name: CONFIG.CACHE_BASIC_CATEGORY,
            maxAgeSeconds:60 * 60 * 10, //缓存10分钟
            //maxEntries:50,
        },
        successResponses: /^0|([12]\d\d)$/,
        origin:new RegExp('^'+CONFIG.ORIGIN+'$')
    });


    //self.addEventListener('message', function (event) { console.log('message', event.data); });

})(self, self['toolbox']);