/**
 * eventUtil 工具对象，封装原生 dom 事件
 * @type {Object}
 * @namespace
 */
var eventUtil = {
  addHandler: function(a, c, b) {
    if (a.addEventListener) {
      a.addEventListener(c, b, false);
    } else {
      if (a.attachEvent) {
        a.attachEvent('on' + c, b);
      } else {
        a['on' + c] = b;
      }
    }
  },
  removeHandler: function(a, c, b) {
    if (a.removeEventListener) {
      a.removeEventListener(c, b, false);
    } else {
      if (a.detachEvent) {
        a.detachEvent('on' + c, b);
      } else {
        a['on' + c] = null;
      }
    }
  },
  getEvent: function(a) {
    return a ? a : window.event;
  },
  getTarget: function(a) {
    return a.target || a.srcElement;
  },
  contains: function(b, a) {
    return b.contains ? b.contains(a) : !!(b.compareDocumentPosition(a) & 16);
  },
  mouseEnterLeave: function(e, d, c) {
    var b = this;
    var a = d === 'mouseenter';
    var g = a ? 'fromElement' : 'toElement';
    var f = function(i) {
      i = i || window.event;
      var j = i.target || i.srcElement;
      var h = i.relatedTarget || i[g];
      if ((e === j || b.contains(e, j)) && !b.contains(e, h)) {
        c();
      }
    };
    d = a ? 'mouseover' : 'mouseout';
    b.addHandler(e, d, f);
    return f;
  },
};

var ga = window.ga;

/**
 * GA Handler
 * @type {Object}
 * @namespace
 */
var gaHandler = {
  /**
   * 初始化
   */
  init: function() {
    var _ = this;
    _.bindEvents();
  },
  /**
   * 绑定事件
   */
  bindEvents: function() {
    // click 行为绑定
    var _ = this;
    var documentBody = document.getElementsByTagName('body')[0];
    eventUtil.addHandler(documentBody, 'click', function(e) {
      var event = eventUtil.getEvent(e);
      var target = eventUtil.getTarget(event);
      var bindTypes = target.getAttribute('ga-bind') || '';
      if (bindTypes.indexOf('click') !== -1) {
        _.handleDomEvent(target);
      }
    });
    // hover 行为绑定
    Array.from(document.getElementsByTagName('*')).map(function(node) {
      var bindTypes = node.getAttribute('ga-bind') || '';
      if (bindTypes.indexOf('hover') !== -1) {
        eventUtil.mouseEnterLeave(node, 'mouseenter', function() {
          _.handleDomEvent(node);
        });
      }
    });
  },
  /**
   * 发送 GA
   * @param  {Object} fieldsObject 绑定参数
   */
  sendGA: function(fieldsObject) {
    ga('send', fieldsObject);
  },
  /**
   * 设置/修改 GA 参数
   * @param  {DOM} target 需要修改 GA 参数的 DOM 节点
   * @param  {Object} fieldsObject 要修改的 GA 参数
   */
  setFields: function(target, fieldsObject) {
    for (var k in fieldsObject) {
      if (fieldsObject.hasOwnProperty(k)) {
        target.setAttribute(k, fieldsObject[k]);
      }
    }
  },
  /**
   * 处理行为事件
   * @param  {DOM} target 绑定参数的 DOM 对象
   */
  handleDomEvent: function(target) {
    var _ = this;
    var fieldsObject;
    if (target.getAttribute('ga-track') === 'social') {
      // 社交跟踪
      fieldsObject = {
        hitType: 'social',
        socialNetwork: target.getAttribute('ga-network'),
        socialAction: target.getAttribute('ga-action'),
        socialTarget: target.getAttribute('ga-target'),
      };
    } else {
      // 默认为事件跟踪
      fieldsObject = {
        hitType: 'event',
        eventCategory: target.getAttribute('ga-category'),
        eventAction: target.getAttribute('ga-action'),
        eventLabel: target.getAttribute('ga-label'),
      };
    }
    // send
    _.sendGA(fieldsObject);
  },
};

gaHandler.init();

window.gaHandler = gaHandler;
