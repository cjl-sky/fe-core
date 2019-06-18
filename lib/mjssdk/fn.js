/**
 *  工具方法
 */
'use strict';
let ua,
  fn = {};
fn.strategySetUA = (strategy, _this, success, done) => {
  let i, reg, flag;
  for (i in strategy) {
    if (Object.prototype.hasOwnProperty.call(strategy, i)) {
      reg = new RegExp(strategy[i], 'ig');
      _this[i] = flag = reg.test(ua);
      if (flag) {
        success(i);
      }
    }
  }
  done();
};

fn.getUA = () => {
  let sysStrategy = {
      android: 'android',
      ios: '(?:ipad|ipod|iphone)',
    },
    appStrategy = {
      mmq: 'mmq/',
      pregnancyhelper: 'pregnancyhelper/',
      gzq: 'gzq/',
      record: 'recordapp/',
    },
    wx = 'micromessenger',
    sysVerStrategy = ' *([0-9.]*)',
    iosSysVerStrategy = 'OS ([0-9.]*)',
    appVerStrategy = '([0-9.]*)',
    app = {
      android: false,
      ios: false,
      mmq: false,
      pregnancyhelper: false,
      gzq: false,
      app: '',
      appVer: '0',
      sys: '',
      sysVer: '0',
      wx: false,
    };

  ua = navigator.userAgent;

  fn.strategySetUA(
    appStrategy,
    app,
    function(i) {
      app.app = i;
    },
    function() {
      if (app.app) {
        let reg = new RegExp(appStrategy[app.app] + appVerStrategy, 'ig');
        if (reg.test(ua)) {
          app.appVer = RegExp['$1'];
        }
      }
    }
  );

  fn.strategySetUA(
    sysStrategy,
    app,
    function(i) {
      app.sys = i;
    },
    function() {
      if (app.sys) {
        let reg = new RegExp(sysStrategy[app.sys] + sysVerStrategy, 'ig');
        if (reg.test(ua)) {
          app.sysVer = RegExp['$1'];
        }
        if (app.ios) {
          reg = new RegExp(iosSysVerStrategy, 'ig');
          if (reg.test(ua)) {
            app.sysVer = RegExp['$1'];
          }
        }
      }
    }
  );

  app.wx = new RegExp(wx, 'ig').test(ua);
  return app;
};

/**
 * fixMethods
 */
fn.fixMethods = () => {
  let i, fixMethods;
  if (!window.android) {
    window.android = {};
  }
  fixMethods = fn.fixMethods;
  for (i in fixMethods) {
    if (Object.prototype.hasOwnProperty.call(fixMethods, i)) {
      fixMethods[i]();
    }
  }
};

/**
 * fix setNavTitle
 */
fn.fixMethods.setNavTitle = () => {
  window.android.setNavTitle = option => {
    if (option) {
      option = JSON.parse(option);
    }
    document.title = option.title;
  };
};

export default fn;
