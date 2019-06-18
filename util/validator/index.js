'use strict';

/**
 * 验证规则
 * @type {Object}
 */
const VALIDATE = {
  url: /^((https|http):\/\/)(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&\/\/=]*)/,
  email: /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
  phone: /^(([0\+]\d{2,3}-)?(0\d{2,3})-)?(\d{7,8})(-(\d{3,}))?$/,
  mobile: /^1[3|4|5|6|7|8|9][0-9]{1}[0-9]{8}$/,
  qq: /[1-9][0-9]{4,}/,
  postCode: /[1-9]\d{5}(?!\d)/,
  ip: /((2[0-4]\d|25[0-5]|[01]?\d\d?)\.){3}(2[0-4]\d|25[0-5]|[01]?\d\d?)/,
};

/**
 * 邮箱
 */
const EMAIL = /^[a-z0-9](?:[-_.+]?[a-z0-9]+)*@company\.com$/i;

/**
 * 网址地址
 */
const URI = /^(https?|ftp):\/\/([a-zA-Z0-9.-]+(:[a-zA-Z0-9.&%$-]+)*@)*((25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9][0-9]?)(\.(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9]?[0-9])){3}|([a-zA-Z0-9-]+\.)*[a-zA-Z0-9-]+\.(com|edu|gov|int|mil|net|org|biz|arpa|info|name|pro|aero|coop|museum|[a-zA-Z]{2}))(:[0-9]+)*(\/($|[a-zA-Z0-9.,?'\\+&%$#=~_-]+))*$/;

module.exports = {
  /**
   * 统一验证函数
   * @param {String} value - 被验证的值
   * @param {String} type  - 被验证的类型
   * @returns {Boolean}
   */
  validate: function(value, type) {
    return VALIDATE[type].test(value);
  },
  /**
   * 是否是公司邮箱
   */
  isCompanyEmail: function(mail) {
    return EMAIL.test(mail.trim());
  },
  /**
   * 合法uri
   */
  validateURL: function(url) {
    return URI.test(url);
  },
  /**
   * 小写字母
   */
  validateLowerCase: function(str) {
    let reg = /^[a-z]+$/;
    return reg.test(str);
  },
  /**
   * 大写字母
   */
  validateUpperCase: function(str) {
    let reg = /^[A-Z]+$/;
    return reg.test(str);
  },
  /**
   * 大小写字母
   */
  validatAlphabets: function(str) {
    let reg = /^[A-Za-z]+$/;
    return reg.test(str);
  },
};
