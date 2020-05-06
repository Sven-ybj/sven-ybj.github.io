var jsBridge = {};

jsBridge.native = {
  data: {}
};
// 是否在android APP中运行
jsBridge.isAndroidApp = /application_ccicAndroid/i.test(navigator.userAgent);

// 是否在iPhone APP中运行
jsBridge.isiPhoneApp = /application_ccicIos/i.test(navigator.userAgent);


// 分享url到微信
jsBridge.native.shareWebtoWeChat = function(p) {
  jsBridge.callNative({
    fun: 'shareWebtoWeChat',
    data: {
      title: p.title,
      type: p.type, // 1.好友 2.朋友圈
      url: p.url,
      desc: p.desc,
      img: p.img
    },
    callback: p.fun
  });
};

var callHandlerFailCount = 0;
// 与原生交互方法
jsBridge.callNative = function(data) {
    // console.log('callNative:', data);
  if (jsBridge.isiPhoneApp) {
    jsBridge.setupWebViewJavascriptBridge(function(bridge) {
      bridge.callHandler(data.fun, data.data, function responseCallback(
        responseData
      ) {
        if (typeof data.callback === 'function') {
          data.callback(responseData);
        }
      });
    });
  } else if (jsBridge.isAndroidApp) {
    // andorid从老系统返回时偶尔报错callHandler不是一个function，应该是还未注入到webview，使用setTimeout反复调用
    if ((!window.WebViewJavascriptBridge) || (!window.WebViewJavascriptBridge.callHandler)) {
      callHandlerFailCount++;
      // 失败超过100次后停止
      if (callHandlerFailCount > 100) {
        return;
      }
      setTimeout(() => {
        jsBridge.callNative(data);
      }, 300)
      return;
    }
    window.WebViewJavascriptBridge.callHandler(data.fun, data.data, function(
      responseData
    ) {
      var responseDataJson = {};
      if (responseData) {
        responseDataJson = JSON.parse(responseData);
      }
      if (typeof data.callback === 'function') {
        data.callback(responseDataJson);
      }
    });
  }
};

//
jsBridge.setupWebViewJavascriptBridge = function(callback) {
  if (window.WebViewJavascriptBridge) {
    // eslint-disable-next-line no-undef
    return callback(WebViewJavascriptBridge);
  } else {
    document.addEventListener(
      'WebViewJavascriptBridgeReady',
      function() {
        // eslint-disable-next-line no-undef
        callback(WebViewJavascriptBridge);
      },
      false
    );
  }
  if (window.WVJBCallbacks) {
    return window.WVJBCallbacks.push(callback);
  }
  window.WVJBCallbacks = [callback];
  var WVJBIframe = document.createElement('iframe');
  WVJBIframe.style.display = 'none';
  WVJBIframe.src = 'wvjbscheme://__BRIDGE_LOADED__';
  document.documentElement.appendChild(WVJBIframe);
  setTimeout(function() {
    document.documentElement.removeChild(WVJBIframe);
  }, 0);
};

