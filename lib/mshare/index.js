'use strict';

import extendWith from 'lodash.assignwith';
import jsonp from 'jsonp';
import libInfo from './lib-info.json';

const DemoJSBridge = {};

let M_CONFIG = window.M_CONFIG || {},
  share = M_CONFIG.share || {},
  appVersion = window.navigator.appVersion;

let UA = {
  isUC: /ucbrowser/i.test(appVersion),
  isQQApp: /qq\//i.test(appVersion),
  isQQBrowser: /mqqbrowser/i.test(appVersion),
  isWeChat: /micromessenger/i.test(appVersion),
  isMApp:
    /mmq/i.test(appVersion) ||
    /gzq/i.test(appVersion) ||
    /pregnancyhelper/i.test(appVersion) ||
    /recordapp/i.test(appVersion),
};

let shareDefaultVal = {
  title: '网站',
  desc: '网站',
  link: window.location.href,
  imgUrl: window.location.protocol + '//static-files.demo.cn/common/demo-logo.png',
  wechatSignUrl: window.location.protocol + '//weixin.demo.cn/wxapp/Api/common/getCommonSignPackage',
  navRightBtnTxt: '分享',
  notEncodeShareURL: true,
  ztID: 0,
  success: null,
  ready: null,
};

function customExtend(obj, srcObj) {
  return extendWith(obj, srcObj, function(objVal, srcVal) {
    return objVal ? objVal : srcVal;
  });
}

function MShare(config) {
  this.weChat = {};
  this.weChat.curTryCount = 0;
  this.share = customExtend(share, shareDefaultVal);
  this.updateConfig(config);
}

// 部分 App 和浏览器支持直接唤起分享的弹框, 此时不需要显示引导分享的弹窗
// 统一通过此方法来显示引导分享的弹窗, 会自动判断是显示弹窗还是直接唤起分享的弹框
MShare.prototype.showShareGuide = function(callback) {
  if (UA.isQQApp || UA.isWeChat) {
    callback && callback();
  } else if (UA.isQQBrowser) {
    this.showShareGuide4QQBrowser();
  } else if (UA.isUC) {
    this.showShareGuide4UC();
  } else if (UA.isMApp) {
    this.showShareGuide4MApp();
  } else {
    callback && callback();
  }
};

MShare.prototype.showShareGuide4QQBrowser = function() {
  let shareInfo = {
    url: this.share.link,
    title: this.share.title,
    description: this.share.desc,
    img_url: this.share.imgUrl,
    img_title: this.share.title,
    content_type: 0,
  };
  let success = () => {
    this.countShare('', this.share.ztID);
    this.share.success && this.share.success();
  };
  if (window.browser) {
    window.browser.app && window.browser.app.share(shareInfo, success);
  }
  if (window.qb) {
    window.qb.share && window.qb.share(shareInfo, success);
  }
};

// 注意: 目前 UC 浏览器不支持分享缩略图的设置, 会自动对网页截图作为分享缩略图
MShare.prototype.showShareGuide4UC = function() {
  let shareInfo = [this.share.title, this.share.desc, this.share.link, '', '', '', ''];
  if (window.ucbrowser) {
    window.ucbrowser.web_share && window.ucbrowser.web_share.apply(null, shareInfo);
  }
  if (window.ucweb) {
    window.ucweb.startRequest && window.ucweb.startRequest('shell.page_share', shareInfo);
  }
};

MShare.prototype.showShareGuide4MApp = function() {
  DemoJSBridge.openSharePlatform({
    mshareTitle: this.share.title,
    mshareDesc: this.share.desc,
    mshareImage: this.share.imgUrl,
    mshareUrl: this.share.link,
  });
};

MShare.prototype.updateConfig = function(config) {
  if (config) {
    this.share = customExtend(config, this.share);
  }

  this.share.link = formatURL(this.share.link);
  this.share.imgUrl = formatURL(this.share.imgUrl);

  if (UA.isQQApp) {
    this.getWeChatSign().then(() => {
      this.initConfig4QQ();
    });
  } else if (UA.isUC) {
    // UC 浏览器目前仅支持在调用 web_share 接口时自定义分享信息, 不支持单独设置
  } else if (UA.isWeChat) {
    this.getWeChatSign().then(() => {
      this.initConfig4WeChat();
    });
  } else if (UA.isQQBrowser) {
    this.initConfig4QQBrowser();
  } else if (UA.isMApp) {
    this.initConfig4App();
  } else {
    // 未知的 UA 暂时不做处理
  }
};

MShare.prototype.initConfig4QQBrowser = function() {
  if (window.browser || window.qb) {
    let shareInfo = {
      url: this.share.link,
      title: this.share.title,
      description: this.share.desc,
      img_url: this.share.imgUrl,
      img_title: this.share.title,
      // callback: () => {
      //     alert('initConfig4QQBrowser');
      // }
    };
    if (window.browser) {
      window.browser.app && window.browser.app.setShareInfo(shareInfo);
    }
    if (window.qb) {
      window.qb.share && window.qb.setShareInfo(shareInfo);
    }
  } else {
    this.loadJSSDK('//jsapi.qq.com/get?api=app.share,app.setShareInfo').then(() => {
      this.initConfig4QQBrowser();
    });
  }
};

MShare.prototype.initConfig4QQ = function() {
  if (window.setShareInfo) {
    let shareInfo = {
      title: this.share.title,
      summary: this.share.desc,
      pic: this.share.imgUrl,
      url: this.share.link,
    };

    shareInfo.WXconfig = {
      swapTitleInWX: false,
      appId: this.weChat && this.weChat.appId,
      timestamp: this.weChat && this.weChat.timestamp,
      nonceStr: this.weChat && this.weChat.nonceStr,
      signature: this.weChat && this.weChat.signature,
    };

    shareInfo.callback = () => {
      this.countShare('', this.share.ztID);
      this.share.success && this.share.success();
    };

    window.setShareInfo(shareInfo);
  } else {
    this.loadJSSDK('//qzonestyle.gtimg.cn/qzone/qzact/common/share/share.js').then(() => {
      this.initConfig4QQ();
    });
  }
};

MShare.prototype.initConfig4WeChat = function() {
  if (window.wx) {
    let config = {
      debug: false,
      jsApiList: ['onMenuShareTimeline', 'onMenuShareAppMessage', 'onMenuShareQQ', 'onMenuShareWeibo'],
      appId: this.weChat.appId,
      nonceStr: this.weChat.nonceStr,
      signature: this.weChat.signature,
      timestamp: this.weChat.timestamp,
    };

    if (window.WeixinJSBridge) {
      window.wx.config(config);
      window.wx.ready(() => {
        if (this.share.ready) this.share.ready();
        window.wx.onMenuShareTimeline(this.getWeChatConfig('cirfriend'));
        window.wx.onMenuShareAppMessage(this.getWeChatConfig('friend'));
        window.wx.onMenuShareQQ(this.getWeChatConfig('qq'));
        window.wx.onMenuShareWeibo(this.getWeChatConfig());
      });
    } else {
      if (this.weChat.curTryCount < 10) {
        this.weChat.curTryCount++;
        setTimeout(() => {
          this.initConfig4WeChat();
        }, 500);
      } else {
        console.warn('WeixinJSBridge initialization timeout.');
      }
    }
  } else {
    this.loadJSSDK('//res.wx.qq.com/open/js/jweixin-1.2.0.js').then(() => {
      this.initConfig4WeChat();
    });
  }
};

MShare.prototype.initConfig4App = function() {
  window.Demo = window.Demo || {};

  window.Demo.getShare = fnName => {
    let shareInfo = `{  'mshareTitle': ${this.share.title},
                            'mshareDesc': ${this.share.desc},
                            'mshareImage': ${this.share.imgUrl},
                            'mshareUrl': ${this.share.link} }`;
    if (typeof fnName == 'undefined' || fnName == null) {
      return shareInfo;
    } else {
      new Function(fnName + "('" + shareInfo + "')")();
    }
  };

  window.Demo.shareResult = function(type, status) {
    Object.prototype.toString.call(window.Demo.shareResultCallback) === '[object Function]' &&
      window.Demo.shareResultCallback(type, status);
  };

  window.shareCallBack = function() {
    Object.prototype.toString.call(window.Demo.ygShareResultCallback) === '[object Function]' &&
      window.Demo.ygShareResultCallback();
  };

  window.Demo.shareResultCallback = (type, status) => {
    this.share.success && this.share.success();
    if (status == 1) {
      if (type == 1) {
        this.countShare('friend', this.share.ztID);
      } else if (type == 2) {
        this.countShare('cirfriend', this.share.ztID);
      } else if (type == 3) {
        this.countShare('sinaweibo', this.share.ztID);
      } else if (type == 4) {
        this.countShare('qqzone', this.share.ztID);
      } else if (type == 5) {
        this.countShare('tencentweibo', this.share.ztID);
      } else if (type == 6) {
        this.countShare('qq', this.share.ztID);
      } else {
        this.countShare('', this.share.ztID);
      }
    }
  };

  window.Demo.ygShareResultCallback = () => {
    this.share.success && this.share.success();
    this.countShare('', this.share.ztID);
  };

  this.setNavRightBtnInfo();
};

MShare.prototype.setNavRightBtnInfo = function() {
  if (window.DemoJSBridge) {
    let demoJSBridge = window.DemoJSBridge;
    let info = {
      text: this.share.navRightBtnTxt,
      type: 4,
      ext: {
        mshareTitle: this.share.title,
        mshareDesc: this.share.desc,
        mshareImage: this.share.imgUrl,
        mshareUrl: this.share.link,
        notEncodeShareURL: this.share.notEncodeShareURL,
      },
    };

    // 为何使用 setTimeout 包裹 navRightButtonInfo?
    // 某些时候存在 navRightButtonInfo 执行完后 URL 才改变了的情况,
    // 一旦 URL 改变 App 端就会忘记之前 navRightButtonInfo 设置的信息,
    // 所以这里用 setTimeout 包裹保证 URL 变了之后再用 navRightButtonInfo 设置信息.
    setTimeout(() => {
      demoJSBridge.navRightButtonInfo && demoJSBridge.navRightButtonInfo(info);
    }, 100);
  } else {
    this.loadJSSDK('//static.demo.cn/std/lib/DemoJSBridge/1.0/DemoJSBridge.min.js').then(() => {
      this.setNavRightBtnInfo();
    });
  }
};

MShare.prototype.getWeChatSign = function() {
  return new Promise((resolve, reject) => {
    let nowURL = encodeURIComponent(window.location.href.split('#')[0]),
      jsonpURL = `${this.share.wechatSignUrl}?nowUrl=${nowURL}`;
    jsonp(jsonpURL, {}, (err, res) => {
      let data = res.data;
      if (err) {
        reject(new Error('Get WeChat config failed.'));
        return;
      }
      if (res.code === 0) {
        this.weChat.appId = data.appId;
        this.weChat.timestamp = data.timestamp;
        this.weChat.nonceStr = data.nonceStr;
        this.weChat.signature = data.signature;
        resolve(this.weChat);
      } else {
        reject(new Error(res.msg));
      }
    });
  });
};

MShare.prototype.loadJSSDK = function(url) {
  return new Promise((resolve, reject) => {
    getScript(url, () => {
      resolve();
    });
  });
};

MShare.prototype.getWeChatConfig = function(type) {
  return {
    title: this.share.title,
    desc: this.share.desc,
    link: this.share.link,
    imgUrl: this.share.imgUrl,
    success: () => {
      this.countShare(type, this.share.ztID);
      this.share.success && this.share.success();
    },
  };
};

MShare.prototype.countShare = function(type, ztID) {
  type = type || '';
  if (ztID) {
    let _img = new Image();
    _img.src = `//act.demo.cn/home/v6/share/index/count?parse=${type}&zt_id=${ztID}&callback=`;
  }
};

MShare.prototype.version = libInfo.version;

// 对于链接是否有协议头做判断和拼接
function formatURL(url) {
  if (url && (url.indexOf('http:') === 0 || url.indexOf('https:') === 0)) {
    return url;
  } else {
    return url ? `${window.location.protocol}${url}` : '';
  }
}

// 替代 jquery 的 getScript 方法
function getScript(source, callback) {
  let script = document.createElement('script');
  let prior = document.getElementsByTagName('script')[0];
  script.async = 1;

  script.onload = script.onreadystatechange = function(_, isAbort) {
    if (isAbort || !script.readyState || /loaded|complete/.test(script.readyState)) {
      script.onload = script.onreadystatechange = null;
      script = undefined;
      if (!isAbort) {
        if (callback) callback();
      }
    }
  };

  script.src = source;
  prior.parentNode.insertBefore(script, prior);
}

export default MShare;
