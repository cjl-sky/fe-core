// 判断浏览器
const Navigator = navigator.userAgent;
const ifAndroid = Navigator.match(/(Android);?[\s\/]+([\d.]+)?/) ? true : false;
const ifiPad = Navigator.match(/(iPad).*OS\s([\d_]+)/) ? true : false;
const ifIos = Navigator.match(/iPhone|iPad|iPd/i) ? true : false;
const ifSafari = ifIos && Navigator.match(/Safari/);
// ios 设备的版本号
let iosVersion = Navigator.match(/OS\s*(\d+)/);
iosVersion = iosVersion ? iosVersion[1] || 0 : 0;
// 安卓版本号
let androidVersion = Navigator.match(/Android\s*(\d+)/);
androidVersion = androidVersion ? androidVersion[1] || 0 : 0;

// 是否从微信打开
const ifWeixin = Navigator.indexOf('MicroMessenger') >= 0; // weixin

// 处理连接
function init(option) {
  let openLink, downloadUrl;
  if (ifIos) {
    openLink = option.iosLink || null;
    // 开启应用宝跳转
    downloadUrl = option.iosYyb || false ? option.yybDownloadUrl || null : option.iosDownloadUrl || null;
  }
  if (ifAndroid) {
    openLink = option.androidLink || null;
    // 开启应用宝跳转
    downloadUrl = option.androidYyb || false ? option.yybDownloadUrl || null : option.androidDownloadUrl || null;
  }
  const params = option.params;
  if (params) openLink = formatUrl(openLink, params); // 格式化url 加参数
  // IOS和IOS9以上的 特殊处理Universal Link
  if (ifIos && iosVersion >= 9) {
    // 如果是自动跳转或者未开启Universal Link 用之前的链接 否则用 Universal Link
    var iosUniversalLinkEnabled = option.iosUniversalLinkEnabled ? true : false;
    openLink = !iosUniversalLinkEnabled ? openLink : option.ios9Link;
  }
  return { openLink, downloadUrl };
}

// 打开APP
function openApp(urlObj, option) {
  const { openLink, downloadUrl } = urlObj;
  // 打开APP
  // IOS使用location.href 安卓走iframe
  if (ifIos) {
    setTimeout(function() {
      location.href = openLink;
    }, 50);
  } else {
    createIframe(openLink);
  }
  checkOpen(function(opened) {
    // APP没有打开成功  并且开启自动跳转到下载页
    if (opened === 0 && option.autoRedirectToDownloadUrl) {
      location.href = downloadUrl;
    }
  });
}

function createIframe(src) {
  var ifr = document.createElement('iframe');
  ifr.id = Math.random()
    .toString(36)
    .substr(2);

  ifr.src = src;
  document.body.appendChild(ifr);
  document.getElementById(ifr.id).style.display = 'none';
  document.getElementById(ifr.id).style.width = '0px';
  document.getElementById(ifr.id).style.height = '0px';
  document.body.appendChild(ifr);
}

// 使用计算时差的方案打开APP
function checkOpen(cb) {
  var _clickTime = +new Date();
  function check(elsTime) {
    if (elsTime > 3000 || document.hidden || document.webkitHidden) {
      cb(1);
    } else {
      cb(0);
    }
  }
  // 启动间隔20ms运行的定时器，并检测累计消耗时间是否超过3000ms，超过则结束
  var _count = 0,
    intHandle;
  intHandle = setInterval(function() {
    _count++;
    var elsTime = +new Date() - _clickTime;
    if (_count >= 100 || elsTime > 3000) {
      clearInterval(intHandle);
      check(elsTime);
    }
  }, 20);
}

// 格式化url
function formatUrl(url, params) {
  var arr = [];
  for (var p in params) {
    if (p && params[p]) {
      arr.push(p + '=' + encodeURIComponent(params[p]));
    }
  }
  arr = arr.join('&');
  var u = url.split('?');
  var newUrl = null;
  if (u.length == 2) {
    newUrl = u[0] + '?' + u[1] + '&' + arr;
  } else {
    newUrl = u[0] + '?' + arr;
  }
  return newUrl;
}

export default class OpenApp {
  constructor(option) {
    this.option = option;
    this.urlObj = init(option);
    this.UA = {
      ifAndroid,
      ifIos,
      ifWeixin,
    };
    if (option.autoLaunchApp) {
      openApp(this.urlObj, option);
    }
  }
  call(newOption) {
    openApp(this.urlObj, { ...this.option, ...newOption });
  }
  download() {
    const { downloadUrl } = this.urlObj;
    location.href = downloadUrl;
  }
}
