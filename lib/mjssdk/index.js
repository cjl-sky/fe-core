import fn from './fn';
import _methods from './methods';
import './Demo';
import extendWith from 'lodash.assignwith';

/**
 * setMethod
 * @param name
 */
let appMethods = Object.assign({}, _methods);
let setMethod = name => {
  if (runMethodByName(name)) {
    MJSSDK[name] = option => {
      let res = {
        code: 0,
        data: option,
      };
      res = Object.assign({}, option, res);
      let json = JSON.stringify(res);
      runMethodByName(name, 'run', json);
    };
  }
};
/**
 *
 * @param time 等待的时间，毫秒单位
 */
const waitTimeout = (time = 0) => {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve();
    }, time);
  });
};

function customExtend(obj, srcObj) {
  return extendWith(obj, srcObj, function(objVal, srcVal) {
    return objVal ? objVal : srcVal;
  });
}
/**
 * setAllMethods
 */
let setAllMethods = () => {
  let i;
  for (i in appMethods) {
    if (Object.prototype.hasOwnProperty.call(appMethods, i)) {
      if (MJSSDK[i]) {
        // console.error('already define ' + i);
      } else {
        +(function(i) {
          setMethod(i);
        })(i);
      }
    }
  }
};

/**
 *runMethodByName
 * @param name {String}
 * @param type {String} run
 * @param option {String}
 * @returns {Function|undefined}
 */
let runMethodByName = (name, type, option) => {
  let fn, i, _class, obj;

  if (MJSSDK.UA.android) {
    i = appMethods[name];
    if (i) {
      _class = i.androidClass ? i.androidClass : 'android';
      obj = window[_class];
      if (!obj) {
        obj = window['android'];
      }
      fn = obj[name];
      if (!fn) {
        fn = undefined;
      }
    } else {
      fn = undefined;
    }
  } else {
    obj = window;
    fn = obj[name];
  }
  /*
   * 两个try 确保app执行的错误捕获
   */
  if (type === 'run') {
    try {
      obj[name](option);
    } catch (e1) {
      try {
        obj[name]();
      } catch (e2) {
        alert('e1:' + e1 + ',e2:' + e2);
        console.error('e1:' + e1 + ',e2:' + e2);
      }
    }
    return false;
  }
  return fn;
};

// 新的 action
const actionList = {
  fetchDeviceID: {
    version: '1.0.0',
  },
  showAudioPlayerEntry: {
    version: '1.0.0',
  },
};

const appCallback = (result = {}, option = {}, globalMethod) => {
  switch (result.code) {
    case 0:
      option.success && option.success(result.data);
      break;
    case 1:
      option.cancel && option.cancel(result);
      break;
    default:
      option.fail && option.fail(result);
  }
  option.complete && option.complete(result);
  // 回调执行完毕，销毁全局函数
  window[globalMethod] = null;
};

// 通用处理结束回调，无客户端返回状态，默认成功
const alwaysCallback = (option = {}) => {
  option.success && option.success({});
  option.complete && option.complete({});
};

/**
 * 注入全局变量
 * @param option 回调勾子
 * @param fixCallback 自定义回调，兼容旧方法
 * @returns {*} 全局函数名
 */
const injectGlobalMethod = (option, fixCallback) => {
  let globalMethod = 'globalMethodFn' + new Date().getTime() + ~~(Math.random() * 10000);
  window[globalMethod] = function(result) {
    let res = result;
    if (fixCallback) {
      res = fixCallback(...arguments);
    }
    appCallback(res, option, globalMethod);
  };
  return globalMethod;
};

const debug = (msg = 'fail') => {
  console.log(msg);
};

const MJSSDK = {
  init(config) {
    this.config = Object.assign({}, config);
    this.UA = fn.getUA();
    fn.fixMethods();
    setAllMethods();
    return this;
  },
  invocation(action, data, option, version) {
    let v = actionList[action] ? actionList[action].version : version;
    if (v) {
      let globalMethodName = injectGlobalMethod(option);

      if (window.MMAPP) {
        try {
          window.MMAPP.invocation(action, v, globalMethodName, JSON.stringify(data));
        } catch (e) {
          window[globalMethodName] = null;
          debug('window.MMAPP.invocation 调用出错，错误信息为：' + e);
        }
      } else {
        window[globalMethodName] = null;
        debug('未支持 window.MMAPP 请在 APP 中调用');
      }
    } else {
      debug('未支持此 action 或缺版本!');
    }
  },
  getApiList() {
    return Object.keys(appMethods);
  },
  /**
   * checkApiByName
   * @param name {string} {"string"}
   * @returns {boolean}
   */
  checkApiByName(name) {
    return !!runMethodByName(name);
  },
  /**
   * compareVer
   * @param ver
   * @param compareVer
   * @returns {number}
   */
  compareVer(ver, compareVer) {
    if (!(compareVer && ver)) {
      throw Error('can`t compare null ver');
    }
    let result = 0,
      compareVerArr = compareVer.split('.'),
      verArr = ver.split('.'),
      length = compareVerArr.length > verArr.length ? compareVerArr.length : verArr.length,
      compareVerItem,
      verItem,
      i;
    for (i = 0; i < length; i++) {
      if (!compareVerArr[i] && verArr[i]) {
        result = 1;
        break;
      } else if (!verArr[i] && compareVerArr[i]) {
        result = -1;
        break;
      } else {
        compareVerItem = parseInt(compareVerArr[i]);
        verItem = parseInt(verArr[i]);
        if (verItem < compareVerItem) {
          result = -1;
          break;
        } else if (verItem === compareVerItem) {
          result = 0;
        } else {
          result = 1;
          break;
        }
      }
    }
    return result;
  },

  /**
   * extend
   * @param obj
   */
  extend(obj) {
    let i;
    appMethods = Object.assign(appMethods, obj);
    for (i in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, i)) {
        +(function(i) {
          setMethod(i);
        })(i);
      }
    }
  },
  /**
   * 阻止返回
   * @param option
   */
  popPreviousStep(option) {
    let callback = option.callback,
      fn = window;
    window.Demo.popPreviousStep.isBan = option.isBan === 1 ? 1 : 0;
    window.Demo.popPreviousStep.callback = MJSSDK.webViewGoBack;
    if (typeof option.callback === 'string') {
      callback = callback.split('.');
      for (let i of callback) {
        fn = fn[i];
      }
      if (typeof fn === 'function') {
        window.Demo.popPreviousStep.callback = fn;
      }
    }
  },
  // 拍照或从手机相册中选图
  chooseImage(option) {
    if (MJSSDK.openPicturePlatform) {
      let globalMethodName = injectGlobalMethod(option, (img, state) => {
        let result = {
          code: -1,
          data: {},
        };
        if (~~state === 1) {
          result.code = 0;
          result.data = {
            base64: `data:image/png;base64,${img}`,
          };
        }
        return result;
      });
      MJSSDK.openPicturePlatform({
        width: option.width || 750,
        type: option.type || 2,
        receiveJS: globalMethodName,
      });
    }
  },
  // 预览图片
  previewImage(option) {
    if (MJSSDK.openNativeGallary) {
      MJSSDK.openNativeGallary({
        index: option.index || 0,
        photoarray: option.photo || [],
      });
      alwaysCallback(option);
    }
  },
  // 获取UID、设备号、广告标识iOS（idfa）
  getDeviceID(option) {
    this.invocation('fetchDeviceID', {}, option, '1.0.0');
  },
  // 是否显示播放器浮层快捷入口
  showAudioPlayerEntry(option) {
    this.invocation(
      'showAudioPlayerEntry',
      {
        isShow: option.isShow || true,
      },
      option
    );
  },
  // 设置导航标题
  setTitle(option) {
    if (MJSSDK.setNavTitle) {
      waitTimeout(50).then(() => {
        MJSSDK.setNavTitle({
          title: option.title || '',
        });
        alwaysCallback(option);
      });
    }
  },
  // 开始录音
  startRecord(option) {
    if (MJSSDK.openRecorderPlatform) {
      let globalMethodName = injectGlobalMethod(option, (base64, state) => {
        let result = {
          code: -1,
          data: {
            base64: '',
            time: 0,
          },
        };
        if (~~state === 0) {
          result.code = 0;
        }
        return result;
      });
      // 兼容安卓未结束或取消的再次开始的 bug
      // IOS 未结束或取消，再次开始，未重新录音
      // 但结束后再开始，间隔太近也会出错，先不处理
      // this.stopRecord();
      // waitTimeout(1000).then(() => {
      MJSSDK.openRecorderPlatform({
        status: 0,
        receiveJS: globalMethodName,
      });
      // })
    }
  },
  // 结束录音
  stopRecord(option) {
    if (MJSSDK.openRecorderPlatform) {
      let globalMethodName = injectGlobalMethod(option, (base64, state, millisecond) => {
        let result = {
          code: -1,
          data: {
            base64: '',
            time: 0,
          },
        };
        if (~~state === 1) {
          result.code = 0;
          // ios 轻聊：如果没有开始，直接调用结束，无上一次录音，返回字符串'(null)'
          if (base64 && base64 !== '(null)') {
            result.data = {
              base64: `data:audio/mp3;base64,${base64}`,
              time: millisecond,
            };
          }
        }
        return result;
      });
      MJSSDK.openRecorderPlatform({
        status: 1,
        receiveJS: globalMethodName,
      });
    }
  },
  // 取消录音
  cancelRecord(option) {
    if (MJSSDK.openRecorderPlatform) {
      let globalMethodName = injectGlobalMethod(option, (base64, state) => {
        let result = {
          code: -1,
          data: {
            base64: '',
            time: 0,
          },
        };
        if (~~state === -1) {
          result.code = 0;
        }
        return result;
      });
      MJSSDK.openRecorderPlatform({
        status: -1,
        receiveJS: globalMethodName,
      });
    }
  },
  // 分享按钮配置
  onMenuShare(option) {
    let shareConfig = {
      title: '网站', // 分享标题，默认'网站'
      desc: '网站',
      link: window.location.href,
      btnText: '',
      btnIcon: '',
      imgUrl: window.location.protocol + '//static-files.demo.cn/common/demo-logo.png',
      success() {},
      cancel() {},
    };
    this.shareConfig = customExtend(option, shareConfig);
    this.onMenuShareUpdate(option);
  },
  onMenuShareUpdate(option) {
    let opt = customExtend(option, this.shareConfig);
    window.Demo.shareResult = function(type, status) {
      if (status === 1) {
        opt.success({ type });
      } else {
        opt.cancel({});
      }
    };
    window.shareCallBack = opt.success;
    let shareConfig = {
      mshareTitle: opt.title,
      mshareDesc: opt.desc,
      mshareImage: opt.imgUr,
      mshareUrl: opt.link,
    };
    let btnIcon = '';
    if (!opt.btnText) {
      btnIcon = window.location.protocol + '//static-files.demo.cn/common/pt-btn-share.png';
    }
    if (MJSSDK.navRightButtonInfo) {
      // 为何使用 setTimeout 包裹 navRightButtonInfo?
      // 某些时候存在 navRightButtonInfo 执行完后 URL 才改变了的情况,
      // 一旦 URL 改变 App 端就会忘记之前 navRightButtonInfo 设置的信息,
      // 所以这里用 setTimeout 包裹保证 URL 变了之后再用 navRightButtonInfo 设置信息.
      setTimeout(() => {
        MJSSDK.navRightButtonInfo({
          type: 4,
          text: opt.btnText || '',
          icon: opt.btnIcon || btnIcon,
          subtype: '',
          waplink: '',
          jsmethod: '',
          ext: shareConfig,
        });
      }, 100);
    }
  },
  // 打开窗口
  openWindow(option) {
    if (MJSSDK.openNewWeb) {
      if (Object.prototype.toString.call(option.close) === '[object Function]') {
        window.Demo.newWebCloseResult = option.close;
      } else {
        window.Demo.newWebCloseResult = () => {};
      }
      MJSSDK.openNewWeb({
        url: option.url || window.location.href,
        title: option.title || window.document.title,
        mode: option.mode || 0,
      });
      alwaysCallback(option);
    }
  },
  // 关闭窗口
  closeWindow(option) {
    if (MJSSDK.webViewFinish) {
      MJSSDK.webViewFinish();
      alwaysCallback(option);
    }
  },
  // 获取网络状态
  getNetworkType(option) {
    if (MJSSDK.networkStatus) {
      let globalMethodName = injectGlobalMethod(option, networkType => {
        let result = {
          code: -1,
          data: {
            networkType: '',
          },
        };
        // IOS 孕管 6.1.04 无网络时返回 '0'
        // IOS 轻聊 8.1.0 无网络时返回最近的网络状态
        // 还会未知，无，等不统一错误情况。
        if (!networkType || parseInt(networkType) === 0) {
        } else {
          result.code = 0;
          result.data.networkType = networkType;
        }
        return result;
      });
      MJSSDK.networkStatus({
        jsmethod: globalMethodName,
      });
    }
  },
  // 震动
  shortVibrate(option) {
    if (MJSSDK.vibrate) {
      MJSSDK.vibrate();
      alwaysCallback(option);
    }
  },
  // 打开原生页面
  openView(option) {
    if (MJSSDK[option.view]) {
      MJSSDK[option.view]();
      alwaysCallback(option);
    }
  },
  // 设置下拉刷新
  changePullRefresh(option, isOpen) {
    if (MJSSDK.isOpenDragRefresh) {
      MJSSDK.isOpenDragRefresh({
        isOpen: isOpen,
      });
      alwaysCallback(option);
    }
  },
  // 启用下拉刷新
  enabledPullRefresh(option) {
    this.changePullRefresh(option, 1);
  },
  // 禁用下拉刷新
  disabledPullRefresh(option) {
    this.changePullRefresh(option, 0);
  },
};

window.DemoJSBridge = MJSSDK;
window.MJSSDK = MJSSDK;

export default MJSSDK;
