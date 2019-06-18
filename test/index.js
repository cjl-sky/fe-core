'use strict';

if (typeof require !== 'undefined') {
  global.expect = require('chai').expect;
  global.sinon = require('sinon');
}

// 引入待测试模块
require('./util/index.test');
require('./util/clean-html.test');
require('./util/date.test');
require('./util/validator.test');
