/**
 * 格式化 URL 参数
 * @param  {String} url    URL
 * @param  {Object} params 参数
 * @return {String}        转换参数后的 URL
 */
const formatURL = (url, params) => {
  params = params || {};
  for (var key in params) {
    var reg = new RegExp(':' + key, 'g');
    url = url.replace(reg, params[key]);
  }
  return url.replace(/[^:]\/\//g, '/');
};

module.exports = {
  formatURL,
};
