import JSONP from 'jsonp';
import assignwith from 'lodash.assignwith';

function extend(obj, srcObj) {
  return assignwith(obj, srcObj, function(objVal, srcVal) {
    return objVal ? objVal : srcVal;
  });
}

function jsonp(url, option) {
  option = option || {};
  return new Promise((resolve, reject) => {
    JSONP(url, option, (err, res) => {
      if (err) {
        reject(new Error(`jsonp failed for ${url}`));
      } else {
        resolve(res);
      }
    });
  });
}

let constant = {
  ERROR: {
    NETWORK_ERROR: 'NETWORK_ERROR', // 网络错误
    ERROR_API: 'ERROR_API', // 接口返回错误
    TIMEOUT: 'TIMEOUT', // 游戏超时
  },
};

let baseOption = {
  speed4Start: 40, // 初始的转动速度
  speed4End: 40, // 准备结束的转动速度
  minRollCount: 56, // 至少转动的次数
  drawURL: '', // 抽奖链接
  done: null, // 回调 抽奖成功
  fail: null, // 回调 抽奖失败
  draw: null, // 回调 请求 drawURL 成功
  activedClass: 'active', // 奖品 DOM 元素被高亮的 class 名
  prizeCount: 8, // 共有多少个奖品
  timeout: 10000, // 超过多少毫秒后如果还没有设置 prizePosition, 抽奖超时
  delayDone: 1000, // 设置抽奖完成时调用 done 回调函数的延迟时间
  prizeItem: [
    // 奖品 DOM 元素配置
    // {
    //     'selector': '',     // 奖品 DOM 元素选择器
    //     'position': 0,      // 奖品实际的 position
    // }
  ],
};

class MLottery {
  constructor(option) {
    (this.currRollCount = 0), // 转动次数
      (this.currSpeed = 0); // 当前转动的速度
    this.currPosition = 0; // 当前奖品实际的 position
    this.prizePosition = 0; // 中奖位置
    this.prizeInfo = null; // 如果设置了 drawURL, drawURL 接口返回的数据会作为 done 的第一个参数
    this.isStarted = false; // 状态 抽奖是否开始
    this.startTime = 0; // 抽奖开始时间点
    option = option || {};
    this.option = extend(option, baseOption);

    this.elPrizeItem = this.option.prizeItem.map(item => {
      return {
        dom: document.getElementById(item.selector),
        position: item.position,
      };
    });
  }
  roll() {
    let activedClass = this.option.activedClass;
    let elPrizeItemActived = this.elPrizeItem.filter(item => item.dom.classList.contains(activedClass));
    this.currRollCount++;
    if (elPrizeItemActived.length === 0) {
      this.elPrizeItem[0].dom.classList.add(activedClass);
    } else {
      let currIndex = (this.currRollCount - 1) % this.option.prizeCount;
      elPrizeItemActived[0].dom.classList.remove(activedClass);
      this.elPrizeItem[currIndex].dom.classList.add(activedClass);
      this.currPosition = this.elPrizeItem[currIndex].position;
    }

    let startRollCount = this.option.minRollCount - this.option.prizeCount;
    if (this.currRollCount > this.option.minRollCount && this.currPosition === this.prizePosition) {
      this.done();
      return;
    } else {
      if (this.currRollCount < startRollCount) {
        this.currSpeed = this.option.speed4Start;
      } else {
        this.currSpeed += this.option.speed4End;
        let nowTime = new Date().getTime();
        if (nowTime - this.startTime > this.option.timeout) {
          this.fail({ type: constant.ERROR.TIMEOUT, message: 'Lottery timeout.' });
          return;
        }
      }
    }
    setTimeout(() => {
      this.isStarted && this.roll();
    }, this.currSpeed);
  }
  start() {
    if (!this.isStarted) {
      if (this.option.drawURL) {
        this.requestPrizePosition()
          .then(res => {
            if (res.code == 0) {
              this.prizePosition = res.data.position;
              this.prizeInfo = res.data;
            } else {
              this.fail({ type: constant.ERROR.ERROR_API, message: res.msg });
            }
          })
          .catch(err => {
            this.fail({ type: constant.ERROR.NETWORK_ERROR, message: err.message });
          });
      }
      this.startTime = new Date().getTime();
      this.isStarted = true;
      this.roll();
    }
  }
  cancel() {
    this.reset();
  }
  reset() {
    this.prizePosition = 0;
    this.currRollCount = 0;
    this.isStarted = false;
    this.startTime = 0;

    let activedClass = this.option.activedClass;
    let elPrizeItemActived = this.elPrizeItem.filter(item => item.dom.classList.contains(activedClass));
    if (elPrizeItemActived.length > 0) {
      elPrizeItemActived[0].dom.classList.remove(activedClass);
    }
  }
  done() {
    setTimeout(() => {
      this.option.done && this.option.done(this.prizeInfo || null);
      this.reset();
    }, this.option.delayDone);
  }
  fail(err) {
    this.option.fail && this.option.fail(err);
    this.reset();
  }
  setPrizePosition(position) {
    this.prizePosition = position;
  }
  requestPrizePosition() {
    return jsonp(this.option.drawURL).then(res => {
      this.option.draw && this.option.draw(res);
      return res;
    });
  }
  static get version() {
    return '1.0.1';
  }
}

export default MLottery;
