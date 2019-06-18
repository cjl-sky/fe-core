/**
 * @see https://github.com/punkave/sanitize-html
 * @type {Function}
 */
var sanitizeHtml = require('sanitize-html');

/**
 * 白名单标签
 * @type {Array}
 */
var allowedTags = [
  'font',
  'embed',
  'a',
  'img',
  'br',
  'strong',
  'b',
  'code',
  'pre',
  'p',
  'div',
  'em',
  'span',
  'h1',
  'h2',
  'h3',
  'h4',
  'h5',
  'h6',
  'table',
  'tr',
  'th',
  'td',
  'hr',
  'ul',
  'ol',
  'li',
  'u',
  'i',
  'dl',
  'dt',
  'dd',
  'iframe',
];

/**
 * 白名单属性
 * @type {Array}
 */
var allowedAttributes = [
  'size',
  'loop',
  'title',
  'value',
  'type',
  'name',
  'size',
  'target',
  'src',
  'href',
  'alt',
  'width',
  'height',
  'rel',
  'tabindex',
];

/**
 * 根据白名单规则过滤 HTML 内容
 * @param  {String} htmlContent 要过滤的 HTML 内容
 *
 * @example
 * var cleanHtml = require('./utils/clean-html');
 * var htmlContent = '<img src="x" alt="hh" onerror=alert("img") /><p></p>';
 * console.log(cleanHtml(htmlContent));
 *
 * @return {String}             经过清除过滤的 HTML 内容
 */
module.exports = function(htmlContent) {
  return sanitizeHtml(htmlContent, {
    allowedTags: allowedTags,
    allowedAttributes: {
      '*': allowedAttributes,
    },
  });
};
