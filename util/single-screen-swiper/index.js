const extend = require('node.extend');
const URI = require('urijs');

const defaultOptions = {
  arrow: $('.arrow-up'),
  swiperClass: '.swiper-container',
  speed: 400,
  showArrow: true,
};

module.exports = {
  init: function(options) {
    let that = this;
    that.options = extend(defaultOptions, options);

    setTimeout(function() {
      that.initSwiper(function(mySwiper) {
        that.bindEvents(mySwiper);
      });
    }, 30);
  },
  bindEvents: function(mySwiper) {
    let that = this;
    that.options.arrow.on('click', function() {
      mySwiper.slideNext();
    });
  },
  initSwiper: function(cb) {
    let that = this;
    let p = URI(location.href)
      .hash()
      .replace(/#/g, '');
    let mySwiper = new Swiper(that.options.swiperClass, {
      direction: 'vertical',
      initialSlide: isNaN(p) ? 0 : p,
      speed: that.options.speed,
      onInit: function(swiper) {
        window.swiperAnimateCache(swiper); // 隐藏动画元素
        window.swiperAnimate(swiper); // 初始化完成开始动画
      },
      onSlideChangeStart: function(swiper) {
        if (!that.options.showArrow) {
          that.options.arrow.hide();
        } else {
          if (swiper.isBeginning || swiper.isEnd) {
            that.options.arrow.hide();
          } else {
            that.options.showArrow && that.options.arrow.show();
          }
        }
      },
      onSlideChangeEnd: function(swiper) {
        window.swiperAnimate(swiper);
        if (mySwiper) {
          location.href = URI(location.href).hash(mySwiper.activeIndex);
        }
      },
    });
    cb && cb(mySwiper);
  },
};
