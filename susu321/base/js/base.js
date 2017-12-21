if (!Array.prototype.forEach) {
    Array.prototype.forEach = function forEach(callback, thisArg) {
        var T, k;
        if (this == null) {
            throw new TypeError("this is null or not defined");
        }
        var O = Object(this);
        var len = O.length >>> 0;
        if (typeof callback !== "function") {
            throw new TypeError(callback + " is not a function");
        }
        if (arguments.length > 1) {
            T = thisArg;
        }
        k = 0;
        while (k < len) {
            var kValue;
            if (k in O) {
                kValue = O[k];
                callback.call(T, kValue, k, O);
            }
            k++;
        }
    };
}

/*
    项目需要兼容以下浏览器
*/

var base = base || {};
(function () {

    var that = this,

        //通过grunt打包时会替换此值， 当此值为_grunt_auto_replace_才能正确匹配到并替换
        _time = "_grunt_auto_replace_",

        //等待执行的模块列表
        pendingModule = [],

        //当前文件名称
        coreFileName = "base.js",

        //requireJs文件名
        requireFileName = "require.js",

        mainAttrName = "ready-main",

        //ready-main
        readyMainSrc = "",

        readyState = "wait", //wait ready  

        //预加载模块
        perModule = [];

    /**
     * 当前项目根所在目录
     */
    this.moduleBaseUrl = function () {
        var srcUrl = "";
        [].forEach.call(document.getElementsByTagName("script"), function (dom) {
            if (dom.src.indexOf(coreFileName) > -1) {
                srcUrl = dom.src;//.match(new RegExp("(.*?)("+coreFileName+")","i"))[1];
                readyMainSrc = dom.getAttribute(mainAttrName);
            }
        });
        return srcUrl.replace(/\/base\/.*$/, "");
    }();

    /**
     * 当前项目根所在目录
     */
    this.moduleUrl = function () {
        return that.moduleBaseUrl.replace(/http(s)?:\/\/.+?\//, window.location.protocol + "//" + window.location.host + "/");
    }();

    /**
     *  根据域名返回当前环境
     */
    this.environment = function () {
        var host = location.href.match(/(http[s]?\:\/\/)(.*?)\//),
            hostNames = {
                "one.xx.com.cn": "prod",
                "onesit.xx.com.cn": "sit",
                "onedev.xx.com.cn": "dev"
            };

        host = host ? host[2] : "";

        return hostNames[host] || "sit";
    }();

    /**
     * Debug打印
     */
    this.opendebugPrint = function () {
        return false;//window.location.host!="ump.susu.com.cn";
    }();

    this.logUl = null;

    this.log = function (msg) {
        if (that.opendebugPrint) {
            if ($("#susu_logs").size() < 1) {
                var html = $('<div id="susu_logs"><div class="log_content"><ul></ul></div><button type="button" class="btn btn-default log_close" onclick="$(this).parent().fadeOut();base.unLockBodyScroll()">关闭</div>');
                that.logUl = html.find("ul");
                $("body").append(html);
            }
            that.logUl.append("<li>" + new Date().Format("yyyy-MM-dd hh:mm:ss") + "<br/>" + msg + "</li>");

            if (window.console) {
                console.log(msg);
            }
        }
    };

    //锁定body滚动条
    this.lockBodyScroll = function () {
        //禁止页面滚动
        if (this.operatingSystem.container == "weixin") {
            // return;
        }
        this._lockBodyTop = $(window).scrollTop();
        $("body").css({
            position: "fixed",
            overflow: "hidden",
            height: this.win.height
            , 'top': this._lockBodyTop * -1
        });
    };

    //解除锁定body滚动条
    this.unLockBodyScroll = function () {
        if (this.operatingSystem.container == "weixin") {
            // return;
        }

        $("body").css({
            position: "",
            overflow: "",
            height: "",
            top: ""
        });

        document.documentElement.scrollTop = this._lockBodyTop;
        document.body.scrollTop = this._lockBodyTop;
    };

    // 判断当前环境
    this.operatingSystem = {
        clientOs: function () {
            var sUserAgent = navigator.userAgent;
            var isWin = (navigator.platform == "Win32") || (navigator.platform == "Windows");
            var isMac = (navigator.platform == "Mac68K") || (navigator.platform == "MacPPC") || (navigator.platform == "Macintosh") || (navigator.platform == "MacIntel");
            if (isMac) {
                return "Mac";
            }
            var isUnix = (navigator.platform == "X11") && !isWin && !isMac;
            if (isUnix) {
                return "Unix";
            }
            var isLinux = (String(navigator.platform).indexOf("Linux") > -1);
            if (isLinux) {
                return "Linux";
            }
            if (isWin) {
                var isWinXP = sUserAgent.indexOf("Windows NT 5.1") > -1 || sUserAgent.indexOf("Windows XP") > -1;
                if (isWinXP) {
                    return "WinXP";
                }
                var isWin7 = sUserAgent.indexOf("Windows NT 6.1") > -1 || sUserAgent.indexOf("Windows 7") > -1;
                if (isWin7) {
                    return "Win7";
                }
            }
            return "other";
        }(),
        browse: function () {
            var browser = {};
            var userAgent = navigator.userAgent.toLowerCase();
            var s;
            (s = userAgent.match(/msie ([\d.]+)/)) ? browser.ie = s[1] : (s = userAgent.match(/firefox\/([\d.]+)/)) ? browser.firefox = s[1] : (s = userAgent.match(/chrome\/([\d.]+)/)) ? browser.chrome = s[1] : (s = userAgent.match(/opera.([\d.]+)/)) ? browser.opera = s[1] : (s = userAgent.match(/version\/([\d.]+).*safari/)) ? browser.safari = s[1] : 0;
            var version = "";
            if (browser.ie) {
                version = 'IE ' + browser.ie;
            }
            else {
                if (browser.firefox) {
                    version = 'firefox ' + browser.firefox;
                }
                else {
                    if (browser.chrome) {
                        version = 'chrome ' + browser.chrome;
                    }
                    else {
                        if (browser.opera) {
                            version = 'opera ' + browser.opera;
                        }
                        else {
                            if (browser.safari) {
                                version = 'safari ' + browser.safari;
                            }
                            else {
                                version = '未知浏览器';
                            }
                        }
                    }
                }
            }
            return version;
        }(),
        container: function () {
            if (isWeiXin()) {
                return "weixin";
            } else if (isWeibo()) {
                return "weibo";
            } else {
                return "web";
            };

            //微信
            function isWeiXin() {
                var ua = window.navigator.userAgent.toLowerCase();

                if (/MicroMessenger/i.test(ua)) {
                    return true;
                } else {
                    return false;
                }
            };
            //微博
            function isWeibo() {
                var ua = navigator.userAgent;
                return (ua.indexOf("Weibo") > -1 && ua.indexOf("_weibo_") > -1);
            };
        }()
    };
    //less than equal to 小于等于ie9版本
    this.operatingSystem.IE9LTET = function () {
        if (that.operatingSystem.browse.indexOf("IE") >= 0) {
            return parseInt(base.operatingSystem.browse.match(/\d+/)[0]) <= 9;
        }
        return false;
    }();

    //less than equal to 小于等于ie8版本
    this.operatingSystem.IE8LTET = function () {
        if (that.operatingSystem.browse.indexOf("IE") >= 0) {
            return parseInt(base.operatingSystem.browse.match(/\d+/)[0]) <= 8;
        }
        return false;
    }();

    this.lessie9 = function () {
        if (that.operatingSystem.IE8LTET) {
            that.alert('升级您的浏览器可以获得更好体验')
        }
    }
    /**
     *  覆盖一级json对象
     */
    this.extend = function (des, src) {
        for (var i in src) {
            des[i] = src[i];
        }
        return des;
    };

    this.isArray = function (o) {
        return o != null && typeof o == "object" && 'splice' in o && 'join' in o;
    };

    this.isFunction = function (o) {
        return typeof o == "function";
    };

    this.isObject = function (o) {
        return typeof o == "object";
    };

    this.isString = function (o) {
        return typeof o == "string";
    };

    this.isBoolean = function (o) {
        return typeof o == "boolean";
    };

    this.isUndefined = function (o) {
        return typeof o == "undefined";
    };

    this.isNumber = function (o) {
        return typeof o == "number";
    };

    /** 动态加载js文件以及css文件
       * @param  {filename} 文件名 String or Array
       * @param  {charset}  文件编码
       * @param  {callback(code)} 文件加载完成回调函数 code[success,error]
       * @demo
              base.loadJsCssFile({
                  filename:'demo.js',
                  charset:'utf-8',
                  media:'',
                  callback:function(status){
                  },
                  attributes:[]
              });
      */
    this.loadJsCssFile = function (params) {
        var dp = {
            filename: null,//array in filename[{filename:'',media:'',charset:'',ftype:''}]
            charset: null,
            media: null,
            ftype: null,
            attributes: [],
            callback: function (code) { }
        }, _index = -1;

        this.extend(dp, params);

        function loadFile(filename, charset, media, callback, ftype, attributes) {
            var fileref, src = filename, filetype, checkFile = true;
            if (typeof filename == 'object') {
                charset = filename.charset || charset;
                media = filename.media || media;
                src = filename.filename;
                ftype = filename.ftype;
                attributes = filename.attributes || attributes;
                checkFile = typeof filename.checkFile == 'boolean' ? filename.checkFile : true;
            }
            filetype = src;

            if (!filetype) {
                that.isFunction(callback) && callback('success');
                return;
            }
            filetype = filetype.substring(filetype.lastIndexOf(".") + 1).toLowerCase();
            filetype = ftype || filetype;

            //createElement
            if (/^js/i.test(filetype)) {
                fileref = document.createElement('script');
                fileref.setAttribute("type", "text/javascript");
                fileref.setAttribute("src", src);
            } else if (/^css/i.test(filetype)) {
                fileref = document.createElement('link');
                fileref.setAttribute("rel", "stylesheet");
                fileref.setAttribute("type", "text/css");
                fileref.setAttribute("href", src);
            }
            else {//如果非此两种文件
                that.isFunction(callback) && callback('error');
            }

            //event and callback bind
            if (typeof fileref != "undefined") {
                charset && fileref.setAttribute("charset", charset);
                media && fileref.setAttribute("media", media);
                if (attributes && attributes.length) {
                    attributes.forEach(function (o) {
                        fileref.setAttribute(o.key, o.value);
                    });
                }
                if (filetype == "css")//css 的onload不兼容所有浏览器
                {
                    that.isFunction(callback) && callback('success');
                }
                else {
                    fileref.onload = fileref.onreadystatechange = function () {
                        if (!this.readyState ||
                            this.readyState == 'loaded' ||
                            this.readyState == 'complete') {
                            (!this.isRunCallback) && that.isFunction(callback) && callback('success');
                            this.isRunCallback = true;
                        }
                    }
                }
                fileref.onerror = function () {
                    that.isFunction(callback) && callback('error');
                };
                document.getElementsByTagName("head")[0].appendChild(fileref);
            }
        }
        if (this.isArray(dp.filename)) {
            (function _load(status) {
                if (status === "error") {
                    dp.callback('error');
                    return;
                }
                _index++;
                if (_index >= dp.filename.length) {
                    dp.callback('success');
                    return;
                }
                loadFile(dp.filename[_index], dp.charset, dp.media, _load, dp.ftype, dp.attributes);
            })();
        }
        else {
            loadFile(dp.filename, dp.charset, dp.media, dp.callback, dp.ftype, dp.attributes);
        }
    };

    //加载require文件并在加载完成后运行所有等待执行的模块
    this.loadJsCssFile({
        filename: this.moduleBaseUrl + "/core/" + requireFileName + "?_t=" + _time,
        //attributes:[{ key:"data-main",value:"main" }],
        callback: function () {

            initRequireJs();

            readyMain();

            runAllPending();

        }
    });



    /**
     * setLocalStorage
     */
    this.setLocalStorage = function (key, value, isJson) {
        that.log("设置localStorage数据key=" + key + ",是否为json数据:" + (isJson ? "true" : "false"));
        if (window.localStorage) {
            if (isJson) {
                value = JSON.stringify(value);
            }
            window.localStorage[key] = value;
        } else {
            that.log("当前浏览器不支持localStorage");
        }
    };
    /**
     * getLocalStorage
     */
    this.getLocalStorage = function (key, isJson) {
        that.log("获取localStorage数据key=" + key + ",是否为json数据:" + (isJson ? "true" : "false"));
        if (window.localStorage) {
            var value = window.localStorage[key] || "";
            if (isJson && value) {
                value = JSON.parse(value);
            }
            that.log("获取localStorage数据key=" + key + ",value=" + value);
            return value;
        } else {
            that.log("当前浏览器不支持localStorage");
        }
    };
    /**
     * removeLocalStorage
     */
    this.removeLocalStorage = function (key) {
        that.log("移除localStorage数据key=" + key);
        if (window.localStorage) {
            window.localStorage.removeItem(key);
        } else {
            that.log("当前浏览器不支持localStorage");
        }
    };
    /**
     * setSessionStorage
     */
    this.setSessionStorage = function (key, value, isJson) {
        var _wkey = "sessionStorage";
        if (/mqqbrowser/i.test(window.navigator.userAgent)) {
            //qq手机浏览器不支持sessionStorage多页面共享
            _wkey = "localStorage";
        }
        that.log("设置sessionStorage数据key=" + key + ",是否为json数据:" + (isJson ? "true" : "false"));
        if (window[_wkey]) {
            if (isJson) {
                value = JSON.stringify(value);
            }
            that.log("设置sessionStorage数据key=" + key + ",value=" + value);
            window[_wkey][key] = value;
        } else {
            that.log("当前浏览器不支持sessionStorage");
        }
    };
    /**
     * getSessionStorage
     */
    this.getSessionStorage = function (key, isJson) {
        var _wkey = "sessionStorage";
        if (/mqqbrowser/i.test(window.navigator.userAgent)) {
            _wkey = "localStorage";
        }
        that.log("获取sessionStorage数据key=" + key + ",是否为json数据:" + (isJson ? "true" : "false"));
        if (window[_wkey]) {
            var value = window[_wkey][key] || "";
            if (isJson && value) {
                value = JSON.parse(value);
            }
            that.log("获取sessionStorage数据key=" + key + ",value=" + value);
            return value;
        } else {
            that.log("当前浏览器不支持sessionStorage");
        }
    };
    /**
     * removeSessionStorage
     */
    this.removeSessionStorage = function (key) {
        var _wkey = "sessionStorage";
        if (/mqqbrowser/i.test(window.navigator.userAgent)) {
            _wkey = "localStorage";
        }
        that.log("移除sessionStorage数据key=" + key);
        if (window[_wkey]) {
            window[_wkey].removeItem(key);
        } else {
            that.log("当前浏览器不支持sessionStorage");
        }
    };
    /**
     * getCookie
     */
    this.getCookie = function (key) {
        that.log("获取cookie值,当前域为" + document.domain + ",key为" + key);
        var arr, reg = new RegExp("(^| )" + key + "=([^;]*)(;|$)");
        arr = document.cookie.match(reg);
        if (arr) {
            that.log("获取cookie值,\r\nkey:" + key + "\r\nvalue:" + arr[2]);
            return unescape(arr[2]);
        } else {
            that.log("获取cookie值,不存在key为" + key + "的cookie");
            return null;
        }
    };
    /**
     * setCookie
     */
    this.setCookie = function (params) {
        params = params || {};
        //params=name, value,domain,expTime分钟
        that.log("设置cookie值,cookie_name为" + params.name);
        var exp = new Date();
        var expires = "";
        if (params.expTime) {
            params.expTime = params.expTime * 60 * 1000;
            exp.setTime(exp.getTime() + params.expTime);
            expires = ";expires=" + exp.toGMTString();
        }
        if (!params.domain) {
            params.domain = document.domain;
        }

        document.cookie = params.name + "="
            + params.value + "; path=/; domain=" + params.domain + ";" + expires;
    };

    /**
     * removeCookie
     */
    this.removeCookie = function (p) {
        var dp = {
            domain: "",
            name: "",
            path: "/"
        };
        if (typeof p == 'object') {
            this.extend(dp, p);
        } else if (typeof p == 'string') {
            dp.name = p;
        }
        if (!dp.domain) {
            dp.domain = document.domain;
        }


        that.log("移除cookie值,当前域为" + dp.domain + ",path为" + dp.path + ",key为" + dp.name);
        var exp = new Date("2000", "1", "1");
        var cval = this.getCookie(dp.name);
        if (cval != null) {
            that.log("成功移除key为" + dp.name + "的cookie值");
            document.cookie = dp.name + "=" + cval + ";domain=" + dp.domain + ";path=" + dp.path + ";expires=" + exp.toGMTString();
        } else {
            that.log("移除cookie值,不存在key为" + dp.name + "的cookie");
        }
    };

    /**
     * gotoUrl
     * @params url 目标地址
     * @params loading 是否显示loading效果,默认显示
     */
    this.gotoUrl = function (url, loading, params) {
        params = params || {};
        if (!url) {
            return false;
        }
        if (loading !== false) {
            window.NProgress && window.NProgress.start();
        }

        url = url || "";

        window.location.href = url;
    };

    var readyFnList=[];
    this.ready=function(fn){
        'use strict'
        
        var preLoadModules=[];
        if(arguments.length==2){
            fn=arguments[1];
            preLoadModules=arguments[0];
            if(!this.isArray(preLoadModules)){
                preLoadModules=[arguments[0]];
            }
        }


        if(readyState=="wait" && fn){
            if(preLoadModules.length){
                readyFnList.push(function(){
                    that.preLoadModule(preLoadModules,fn);
                });
            }else{
                readyFnList.push(fn);
            }
        }else if(readyState=="ready"){
            for(var i;readyFnList.length;){
                readyFnList.shift()();
            }
            if(preLoadModules.length){
                that.preLoadModule(preLoadModules,fn);
            }else{
                fn&&fn();
            }
        }
    };

    /**
     * initRequireJs
     */
    var initRequireJs = function () {

        that.requireComplete = true;

        require.config({
            urlArgs: "_t=" + _time,
            baseUrl: that.moduleBaseUrl,
            paths: {
                jquery: "./core/jquery1.12.4.min",
                bootstrap: "./core/bootstrap.min",
                require_css: "./core/require_css",
                datetimepicker: "./base/component/plugins/bootstrap-datetimepicker",
                actionConf: "./config/actionConf",

                dialog: "./base/component/ui/dialog",
                ajax: "./base/component/plugins/ajax",
                loading: "./base/component/ui/loading",
                toast: './base/component/ui/toast',
                paginator: "./base/component/plugins/bootstrap-paginator"
            },
            //超时时间
            waitSeconds: 60,
            map: {
                '*': {
                    'css': 'require_css'
                }
            },
            shim: {
                loading: ["css!./base/component/ui/loading.css"],
                datetimepicker: ['moment', 'css!./base/component/plugins/bootstrap-datetimepicker.min.css']
            }
        });

    },

        /**
         * 添加需要等待执行的模块
         * @params modules string 模块名称
         * @params fn function 回调函数
         * @params cordova boole 是否cordova插件
         */
        addPending = function (modules, fn, cordova) {

            pendingModule.push({
                modules: modules,
                fn: fn,
                cordova: cordova
            });

        },

        /**
         * 执行模块
         * @params modules string 模块名称
         * @params fn function 回调函数
         * @params cordova boole 是否cordova插件
         */
        runRequire = function (modules, fn, cordova) {

            if (!that.requireComplete) {
                addPending(modules, fn, cordova);
            } else {
                //如果当前调用cordova插件方法且cordova未准备完成
                if (cordova && !that.cordovaComplete) {

                    if (that.isRunApp) {
                        if (that.cordovaComplete) {
                            require(that.isArray(modules) ? modules : [modules], fn);
                        } else {
                            addPending(modules, fn, cordova);
                        }
                    }

                    return;
                }
                require(that.isArray(modules) ? modules : [modules], fn);
            }

        },

        /**
         * 运行所有等待执行的模块
         */
        runAllPending = function () {

            pendingModule.forEach(function (m) {
                runRequire(m.modules, m.fn, m.cordova);
            });

            pendingModule = [];

        },

        readyMain = function () {

            var _count = 0;

            perModule = ['jquery', 'bootstrap'];

            var _callee = function () {
                runRequire(perModule[_count++], function (o) {
                    if (_count >= perModule.length) {

                        readyState = "ready";

                        that.win = {
                            width: $(window).width(),
                            height: $(window).height()
                        };

                        that.ready();

                        if (readyMainSrc) {
                            that.loadJsCssFile({
                                filename: readyMainSrc
                            });
                        }
                    } else {
                        _callee();
                    }
                });
            };
            _callee();


        },

        /**
         * initMethod
         * @params categories string 当前对象下一级命名空间名城 例如: base.saicMethod
         * @params mets array 指定命名空间下所有方法名
         */
        initMethod = function (categories, mets) {

            that[categories] = function () {

                //方法集合
                var exports = {};

                mets.forEach(function (f) {

                    //方法名称
                    var fn = typeof f == 'string' ? f : f.fn,

                        //是否cordova插件
                        isCordova = f.cordova === true;

                    exports[fn] = function () {
                        var params = [].slice.call(arguments);

                        if (isCordova) {
                            params.unshift(fn);
                        }

                        runRequire(categories, function (m) {
                            if (that.isFunction(m)) {
                                //如果返回的就是function对象,直接执行
                                m.apply(that, params);
                            }
                            else if (params.length == 1 && that.isFunction(params[0])) {
                                //判断是否自己处理返回模块
                                params[0](m[fn]);
                            } else {
                                m[fn].apply(that, params);
                            }

                        }, isCordova);

                    };

                });

                return exports;
            }();

        };

    /**
     * 预加载模块
     * @params names string or array 预先加载指定模块
     */
    this.preLoadModule=function(names,callback){
        runRequire(this.isArray(names)?names:[names], callback);
    };

    function _runModule(mname, fn, params, isapply) {
        runRequire(mname, function (m) {
            if (isapply !== false) {
                m[fn].apply(that, params);
            } else {
                m[fn].apply(m, params);
            }
        }, false);
    }

    ["alert", "confirm"].forEach(function (v) {
        that[v] = function () {
            _runModule("dialog", v, [].slice.call(arguments));
        };
    });

    ["toast"].forEach(function (v) {
        that[v] = function () {
            _runModule("toast", v, [].slice.call(arguments));
        };
    });

    that.loading = function () {
        var exports = {};
        ["open", "close"].forEach(function (v) {
            exports[v] = function () {
                _runModule("loading", v, [].slice.call(arguments), false)
            }
        });
        return exports;
    }();

}).call(base);


/*******原型方法添加*******/

//function模板html解析,用法 (function(){}).heredoc();
Function.prototype.heredoc=function(options){
    var text=this.toString().split('\n').slice(1,-1).join('\n') + '\n';

    if(options){
        for(var t in options){
            text=text.repalce('{'+t+'}',options[t]);
        }
    }
    return text;
}

/**
 * 添加或者替换
 * @params [0]  字符串或者json数组对象 [ { k:v } ]
 * @params [1]  当参数0为以字符串作为key时此参数为value
 * @return String
 */
String.prototype.toggleUrlParams = function (k, v) {
    var str = this.toString(),
        reg1 = new RegExp("\\?" + k + "\=.*?\&", "g"),
        reg2 = new RegExp("\&" + k + "\=.*?\&", "g"),
        reg3 = new RegExp("\\?" + k + "\=.*$", "g"),
        reg4 = new RegExp("\&" + k + "\=.*$", "g"),
        m1 = "";

    var _olstr = str;

    //删除锚点数据
    if (/\#.*?/.test(str)) {
        str = str.substring(0, str.indexOf("#"));
        m1 = _olstr.substring(_olstr.indexOf("#"));
    }

    str = str.replace(reg1, "?")
        .replace(reg2, "&")
        .replace(reg3, "")
        .replace(reg4, "");

    return str += (/\?/.test(str) ? "&" : "?") + (k + "=" + v) + m1;
};

/**
 * 得到地址栏参数
 * @param name 参数名称
 * @param urls 从指定的urls获取参数
 * @returns string
 */
String.prototype.getQueryString = function (name, urls) {
    urls = urls || window.location.href;
    if (this) {
        urls = this;
    }

    //删除锚点数据
    if (/\#.*?\&/.test(urls)) {
        urls = urls.substring(0, urls.lastIndexOf("#"));
    }

    if (urls && urls.indexOf("?") > -1) { urls = urls.substring(urls.indexOf("?") + 1); }
    var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i");
    var r = urls ? urls.match(reg) : window.location.search.substr(1).match(reg);
    if (r != null && r[2] != "") {
        var ms = r[2].match(/(\<)|(\>)|(%3C)|(%3E)/g);
        if (ms && ms.length >= 4) {
            //如果检测到有2对及以上开始和结束尖括号
            r[2] = r[2].replace(/(\<)|(%3C)/g, "");
        }
        return r[2];
        // return  unescape(r[2]);
    }
    return null;
};

/**
 * 
 * 添加日期原型方法
 */
String.prototype.FormatDate = function (fmt) {
    var date = this;
    var arr = date.match(/(\d+)/g)
    var _y = arr[0] | 0,
        _M = (arr[1] | 1) - 1,
        _d = arr[2] | 1,
        _h = arr[3] | 0,
        _m = arr[4] | 0,
        _s = arr[5] | 0;

    return new Date(_y, _M, _d, _h, _m, _s).Format(fmt);
};

/**
 * 格式化金钱
 * @places  保留几位小数
 * @symbol  金钱单位
 * @thousand 千位分割符 默认为,
 * @decimal 
 * @return String
 */
Number.prototype.formatMoney = function (places, symbol, thousand, decimal) {
    places = !isNaN(places = Math.abs(places)) ? places : 2;
    symbol = symbol !== undefined ? symbol : "￥";
    thousand = thousand || ",";
    decimal = decimal || ".";
    var number = this,
        negative = number < 0 ? "-" : "",
        i = parseInt(number = Math.abs(+number || 0).toFixed(places), 10) + "",
        j = (j = i.length) > 3 ? j % 3 : 0;
    return symbol + negative + (j ? i.substr(0, j) + thousand : "") + i.substr(j).replace(/(\d{3})(?=\d)/g, "$1" + thousand) + (places ? decimal + Math.abs(number - i).toFixed(places).slice(2) : "");
};

Date.prototype.Format = function (fmt) {
    var o = {
        "M+": this.getMonth() + 1, //月份
        "d+": this.getDate(), //日
        "h+": this.getHours(), //小时
        "m+": this.getMinutes(), //分
        "s+": this.getSeconds(), //秒
        "q+": Math.floor((this.getMonth() + 3) / 3), //季度
        "S": this.getMilliseconds() //毫秒
    };
    if (/(y+)/.test(fmt))
        fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
    for (var k in o)
        if (new RegExp("(" + k + ")").test(fmt))
            fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
    return fmt;
};
Date.prototype.addHours = function (h) {
    this.setHours(this.getHours() + h);
    return this;
};
Date.prototype.addDays = function (d) {
    this.setDate(this.getDate() + d);
    return this;
};
Date.prototype.addWeeks = function (w) {
    this.addDays(w * 7);
    return this;
};
Date.prototype.addMonths = function (m) {
    var d = this.getDate();
    this.setMonth(this.getMonth() + m);
    if (this.getDate() < d)
        this.setDate(0);
    return this;
};
Date.prototype.addYears = function (y) {
    var m = this.getMonth();
    this.setFullYear(this.getFullYear() + y);
    if (m < this.getMonth()) {
        this.setDate(0);
    }
    return this;
};
/*interval ：D表示查询精确到天数的之差
 interval ：H表示查询精确到小时之差
 interval ：M表示查询精确到分钟之差
 interval ：S表示查询精确到秒之差
 interval ：T表示查询精确到毫秒之差*/
Date.prototype.dateDiff = function (interval, date2) {
    var objInterval = { 'D': 1000 * 60 * 60 * 24, 'H': 1000 * 60 * 60, 'M': 1000 * 60, 'S': 1000, 'T': 1 };
    interval = interval.toUpperCase();
    var date2Convert = new Date(date2.replace(/-/g, '/'));
    var thisDateFormat = "yyyy/MM/dd hh:mm:sss";
    switch (interval) {
        case "D":
            thisDateFormat = "yyyy/MM/dd 00:00:000";
            break;
        case "H":
            thisDateFormat = "yyyy/MM/dd hh:00:000";
            break;
        case "M":
            thisDateFormat = "yyyy/MM/dd hh:mm:000";
            break;
        case "S":
            break;
        case "T":
            break;
    }
    var dt1 = Date.parse(this.Format(thisDateFormat));
    var dt2 = Date.parse(date2Convert.Format(thisDateFormat));
    try {
        return Math.round((dt2 - dt1) / objInterval[interval]);
    } catch (e) {

    }
}
