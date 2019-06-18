const extend = require('node.extend');
const createjs = require('preload-js');

const defaultOptions = {
  files: [],
  ready: function() {},
  mainContent: $('#wrapper'),
  stepBgColor: '#403523',
};

module.exports = {
  init: function(options) {
    let that = this;
    that.options = extend(defaultOptions, options);
    that.initDOM();

    let queue = new createjs.LoadQueue(true);
    queue.on('complete', function(e) {
      that.handleFileComplete(e, that);
    });
    queue.on('fileload', function(e) {
      that.handleFileLoad(e, that, queue);
    });
    queue.loadManifest(that.options.files);
    queue.load();
  },
  initDOM: function() {
    let that = this;
    let progressContainerTpl =
      '<div class="progress-container"><div class="progress"><span class="step" style="background-color: ' +
      that.options.stepBgColor +
      ';"></span></div><span class="progress-value">0</span></div>';
    $('body').append($(progressContainerTpl));
  },
  handleFileLoad: function(e, that, queue) {
    let progress = Math.ceil(queue._numItemsLoaded / queue._numItems * 100) + '%';
    $('body')
      .find('.progress-container .step')
      .width(progress);
    $('body')
      .find('.progress-container .progress-value')
      .html(progress);
  },
  handleFileComplete: function(e, that) {
    that.options.mainContent.removeClass('invisible');
    $('body')
      .find('.progress-container')
      .addClass('hidden');
    // 调用用户自定义逻辑
    that.options.ready();
  },
};
