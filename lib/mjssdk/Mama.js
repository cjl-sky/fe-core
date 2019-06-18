/**
 * app 依赖的回调执行的方法,避免报错,先声明一个空方法
 */
'use strict';

const Demo = window.Demo || {};

let setEmptyFn = (obj, str) => {
  str = str.split('.');
  for (let i of str) {
    if (!obj[i]) {
      obj[i] = () => {};
    }
  }
};

+(function() {
  let fnObj = {
    window: {
      obj: window,
      data: ['loginSuccess', 'loadLinks', 'logout', 'loginForMmqCode'],
    },
    Demo: {
      obj: Demo,
      data: ['getShare', 'loadLinks', 'shareResult', 'newWebCloseResult', 'getFuli', 'getFavor', 'noop'],
    },
  };
  for (let i in fnObj) {
    if (Object.prototype.hasOwnProperty.call(fnObj, i)) {
      fnObj[i].data.map(function(val) {
        setEmptyFn(fnObj[i].obj, val);
      });
    }
  }
})();

/**
 * 阻止返回
 */
Demo.popPreviousStep = res => {
  res = JSON.parse(res);
  if (~~res.code === 0) {
    Demo.popPreviousStep.opt = res.data.opt;
    let dataStr =
        '{"code": "0","data":{"status": "' +
        Demo.popPreviousStep.isBan +
        '" ,"opt":"' +
        Demo.popPreviousStep.opt +
        '"}}',
      obj = window;
    if (navigator.userAgent.toLocaleLowerCase().indexOf('android') !== -1) {
      obj = window['android'];
    }
    obj[res.data.callback](dataStr);
    if (Demo.popPreviousStep.isBan === 1) {
      Demo.popPreviousStep.callback(Demo.popPreviousStep.opt);
    }
  } else {
    console.error(res.msg);
  }
  return '{"code": 0,"data":""}';
};

Demo.popPreviousStep.opt = 1;
Demo.popPreviousStep.isBan = 0;
Demo.popPreviousStep.callback = () => {};

window.Demo = Demo;
