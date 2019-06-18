/**
 * @author wangjin (wangjin@demo.cn)
 */

const ua = {
  isWeChat: /micromessenger/i.test(navigator.appVersion),
};

/**
 *  @this MusicObject
 */
function removeUserGestureHandler() {
  if (this.__eventHandler) {
    if (ua.isWeChat) {
      document.removeEventListener('WeixinJSBridgeReady', this.__eventHandler);
    }
    document.body.removeEventListener('touchstart', this.__eventHandler);
    document.body.removeEventListener('mousemove', this.__eventHandler);
    document.body.removeEventListener('click', this.__eventHandler);
  }
}

/**
 * @this MusicObject
 * @param {string} activeClassName
 * @param {boolean} initialAutoPlay
 * @return {Promise<any> | Promise.<*>}
 */
function bindEvents(activeClassName, initialAutoPlay) {
  let promiseResolved = false;
  let inFakeAutoPlay = false; // fakeAutoPlay 模式：当初始化 autoplay 值为 false 值，用户点击屏幕或者 WXJSBRIDGE 事件调用时。
  let userGestureTriggered = false; // 用户事件是否已经触发过（ WXJSBRIDGE 和 用户的 touchstart 事件）

  let el = this.el;
  let elIndicator = this.elIndicator;

  /**
   * @todo 利用 autoplay 播放一段测试静音音乐
   * @description 对于一些不需要用户操作就能立刻调用 play() 的，我们需要立刻把 promise 抛出去外部，以表示可操作状态。
   * @deprecated 由于微信的 webview ，在 autoplay = true 时会触发 play 事件，且 TMD 居然 this.el.paused = false. 导致暂时没法使用。
   * @return {Promise}
   */
  /* let playTestMusic = () => {
        return new Promise((res) => {
            let handler = (e) => {
                this.el.removeEventListener("play", handler);
                alert(this.el.paused); // false
                // ios 十分鸡贼地把第一次播放的触发了 play 事件，且注入时 paused = false，做一次异步操作;
                setTimeout(() => {
                    alert(this.el.paused); // true
                    if (!this.el.paused) {
                        if (!userGestureTriggered) {
                            this.el.currentTime = 0;
                            if (!initialAutoPlay) {
                                this.el.pause();
                            }
                            alert("res1");
                            res();
                        }
                    }
                    this.el.muted = false; // 把静音去除
                }, 0);
            };

            this.el.addEventListener("play", handler);

            // 静音，令用户无感知音乐播放过
            this.el.muted = true;

            // 强制播放静音音乐
            this.play();
        });
    }; */

  // return promises funtion
  let gestureEventsBinding = () => {
    return new Promise((res, rej) => {
      let setResolved = () => {
        if (!promiseResolved) {
          res();
          promiseResolved = true;
        }
      };
      let handler = e => {
        let eventType = e.type;
        let eventTarget = e.target;
        let eventCurrentTarget = e.currentTarget;

        switch (eventType) {
          case 'play':
            {
              if (!inFakeAutoPlay && !this.el.paused) {
                setResolved();
              }

              if (promiseResolved) {
                this.elIndicator.classList.add(activeClassName);
              }
            }
            break;

          case 'pause':
            {
              this.elIndicator.classList.remove(activeClassName);
            }
            break;

          case 'click':
            {
              if (eventCurrentTarget === this.elIndicator) {
                if (this.el.paused) {
                  this.play().catch(e => rej(e));
                } else {
                  this.pause();
                }
              } else if (eventCurrentTarget === document.body) {
                this.play().catch(e => rej(e));
              }
            }
            break;

          case 'mousemove':
          case 'touchstart':
          // fall-through
          case 'WeixinJSBridgeReady':
            {
              userGestureTriggered = true;
              // 改由 play 事件 resolve，直接点击音乐播放按钮。
              if (eventType === 'touchstart') {
                if (eventTarget === this.el || eventTarget === this.elIndicator) {
                  // 用户直接点击音乐按钮时，需要特殊处理。
                  break;
                }
              }

              if (this.el.paused) {
                if (!initialAutoPlay) {
                  // 静音，令用户无感知音乐播放过（为了获得权限，且过后保持非自动播放状态）
                  this.el.muted = true;
                  inFakeAutoPlay = true;
                }

                this.play()
                  .then(() => {
                    if (!initialAutoPlay) {
                      this.el.pause();
                      this.el.currentTime = 0; // 因为初始化不设置 autoplay, 所以把音乐跳到初始状态（假装没播放过）
                      setResolved();
                      this.el.muted = false;
                      inFakeAutoPlay = false;
                    }
                  })
                  .catch(e => rej(e));
              }
            }
            break;
        }
      };
      let globalEventHandlerBinded = handler.bind(this);

      // operations
      // bind events
      el.addEventListener('pause', globalEventHandlerBinded);
      el.addEventListener('play', globalEventHandlerBinded);
      elIndicator.addEventListener('click', globalEventHandlerBinded);
      if (ua.isWeChat) {
        // 微信自动播放
        document.addEventListener('WeixinJSBridgeReady', globalEventHandlerBinded);
      }
      // fallback
      document.body.addEventListener('touchstart', globalEventHandlerBinded);
      document.body.addEventListener('click', globalEventHandlerBinded);
      // for pc
      document.body.addEventListener('mousemove', globalEventHandlerBinded);

      // public
      this.__eventHandler = globalEventHandlerBinded;
    });
  };

  // 假如 autoplay = false 获取权限没问题的话就可以用下面这段了。
  /* if (initialAutoPlay) {
        return gestureEventsBinding();
    } else {
        return Promise.race([playTestMusic(), gestureEventsBinding()]);
    } */

  return gestureEventsBinding();
}

/**
 * @param {Node} el
 * @param {String} name
 * @return {Promise}
 */
function bindOnce(el, name) {
  return new Promise(res => {
    let handler = () => {
      el.removeEventListener(name, handler);
      res();
    };
    el.addEventListener(name, handler);
  });
}

/**
 * @typedef {Object} MusicObjectConf
 * @property {String} className - 音乐图标的类名
 * @property {String} activeClassName - 音乐图标在播放状态的类名
 * @property {String} injectAt - 插入元素的 id （默认是 document.body)
 * @property {Boolean} autoplay - 是否自动播放
 * @property {Boolean} loop - 是否循环播放
 */
class MusicObject {
  /**
   * @constructor
   * @param {String} src - 音乐文件路径
   * @param {MusicObjectConf} conf
   */
  constructor(
    src,
    { className = 'g-music', activeClassName = 'g-music--active', injectAt, autoplay = true, loop = true } = {}
  ) {
    if (!src) {
      throw Error('MusicObject: 音乐链接为空，请确认传入参数是否正确。');
    }

    let injectTarget = injectAt ? document.getElementById(injectAt) : document.body;

    if (!injectTarget) {
      throw Error('MusicObject: 请确认 injectAt 参数是否正确，无法获取对应的元素。');
    }

    let el = new Audio(src);
    let elIndicator = document.createElement('div'); // 音乐图片
    let initialAutoplay = !!autoplay;
    this.el = el;
    this.elIndicator = elIndicator;
    this.el.src = src;
    this.loop = !!loop;
    this.autoplay = !!autoplay;
    // promise 被 resolved 后为 true， 一旦为 true，那么就代表所有音乐的方法都可以被使用了。
    this.isInitialized = false;

    // el.style.width = 0;
    // el.style.height = 0;
    // el.style.visibility = "hidden";

    elIndicator.classList.add(className);
    elIndicator.appendChild(el);
    injectTarget.insertBefore(elIndicator, injectTarget.firstElementChild);

    return bindEvents
      .call(this, activeClassName.toString(), initialAutoplay)
      .then(() => {
        // 清除所有因为获取权限而绑定的事件
        removeUserGestureHandler.call(this);
        // 对于之前播放过假音乐的，要重新给 autoplay 赋值，保证抛出去时状态稳定
        el.autoplay = initialAutoplay;
        this.isInitialized = true;
        return this;
      })
      .catch(e => {
        // 清除所有因为获取权限而绑定的事件
        removeUserGestureHandler.call(this);
        return Promise.reject(e);
      });
  }

  /**
   * @see https://developers.google.com/web/updates/2017/06/play-request-was-interrupted
   * @todo 解决了 ios 和 部分安卓机的报错问题，避免传上 fundebug。
   * (安卓/苹果) NotAllowedError: play() can only be initiated by a user gesture.
   * (苹果) NotAllowedError: The request is not allowed by the user agent or the platform in the current context, possibly because the user denied permission.
   * (苹果) DomError: The operation was abort.
   * @description 播放方法，同 HTMLAudioElement 的 play() 方法一致。
   * @return {Promise}
   */
  play() {
    return new Promise((res, rej) => {
      // always return promise.
      let promiseOrUndefined;
      if (this.el.paused) {
        promiseOrUndefined = this.el.play();
      }

      if (promiseOrUndefined !== undefined) {
        return promiseOrUndefined
          .then(() => {
            res();
          })
          .catch(e => rej(e));
      } else {
        res();
      }
    }).catch(e => {
      if (
        !(
          e.name.toLowerCase() === 'domerror' ||
          e.name.toLowerCase() === 'notallowerror' ||
          e.message === 'play() can only be initiated by a user gesture.'
        )
      ) {
        return Promise.reject(e);
      }
    });
  }

  replay() {
    this.el.currentTime = 0;
    this.play();
  }

  /**
   * @see https://developers.google.com/web/updates/2017/06/play-request-was-interrupted
   * @todo 解决了调用了 play() 后立刻被 paused() 会跳出 DomException 的问题。
   *      以及用户在音乐加载过程中抛出
   *      (安卓) AbortError: The play() request was interrupted by a call to pause().
   *      (苹果) AbortError: The operation was aborted.
   * @description 暂停方法，同 HTMLAudioElement 的 pause() 方法一致。
   * @return {Promise}
   */
  pause() {
    let handler = e => {
      this.elIndicator.classList.remove(this._activeClassName);
      if ((e instanceof Error && e.name.toLowerCase() === 'aborterror') || !e) {
        return Promise.resolve();
      } else {
        return Promise.reject(e);
      }
    };

    let promise = null;

    if (this.el.paused) {
      promise = new Promise(res => {
        this.el.pause();
        res();
      });
    } else {
      // 先等待播放的 promise resolved 后再暂停，否则会报错
      return this.play().then(() => {
        this.el.pause();
        return Promise.resolve();
      });
    }

    return promise.then(handler, handler);
  }

  load(src, { autoplay = true, loop = true } = {}) {
    let promise = this.pause().then(() => {
      return new Promise(res => {
        setTimeout(() => {
          this.el.src = src;
          this.autoplay = !!autoplay;
          this.loop = !!loop;
          res();
        }, 0);
      });
    });

    if (autoplay) {
      return promise.then(() => {
        return this.play();
      });
    } else {
      return promise;
    }
  }

  destory() {
    return this.pause().then(() => {
      return new Promise(res => {
        let globalEventHandlerBinded = this.__eventHandler;
        let el = this.el;
        let elIndicator = this.elIndicator;
        if (this.__eventHandler) {
          el.removeEventListener('pause', globalEventHandlerBinded);
          el.removeEventListener('play', globalEventHandlerBinded);
          elIndicator.removeEventListener('click', globalEventHandlerBinded);
          removeUserGestureHandler.call(this);

          elIndicator.parentNode.removeChild(elIndicator);
          this.el = null;
          this.elIndicator = null;
          this.isInitialized = null;
          this.prototype = null;
          this.__eventHandler = null;
          res('destoryed');
        }
      });
    });
  }

  waitUntilPause() {
    return bindOnce(this.el, 'pause');
  }

  waitUntilPlay() {
    return bindOnce(this.el, 'play');
  }

  set autoplay(isAutoplay) {
    this.el.autoplay = !!isAutoplay;
  }

  get autoplay() {
    return this.el.autoplay;
  }

  set loop(isLoop) {
    this.el.loop = !!isLoop;
  }

  get loop() {
    return this.el.loop;
  }

  get paused() {
    return this.el.paused;
  }
}

/**
 * @static
 * @public
 * @param {String} src - 音乐链接
 * @param {MusicObjectConf} conf - 配置项
 * @return {MusicObject}
 */
MusicObject.inject = (src, conf = {}) => {
  let mo = new MusicObject(src, conf);
  return mo;
};
MusicObject.version = '1.3.2';

export default MusicObject;
