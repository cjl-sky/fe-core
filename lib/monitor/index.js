import Fundebug from 'fundebug-javascript';

// 默认忽略 Script Error 异常的上报
Fundebug.filters = [
  {
    message: /^Script error\.$/,
  },
];

/**
 * 如果检测到环境非线上环境, 不发送异常信息
 * 避免没有设置 SERVER_ENV 的情况，默认在 development 模式（关闭 fundebug）
 */
let serverEnv = window.SERVER_ENV || 'development';
if (serverEnv && serverEnv.toLowerCase() !== 'production') {
  Fundebug.silent = true;
}

function formatComponentName(vm) {
  if (vm.$root === vm) return 'root';
  let name = vm._isVue ? (vm.$options && vm.$options.name) || (vm.$options && vm.$options._componentTag) : vm.name;
  return (
    (name ? 'component <' + name + '>' : 'anonymous component') +
    (vm._isVue && vm.$options && vm.$options.__file ? ' at ' + (vm.$options && vm.$options.__file) : '')
  );
}

function setApikey(apikey) {
  Fundebug.apikey = apikey;
}

function setAppversion(appVersion) {
  Fundebug.appversion = appVersion;
}

function setReleasestage(releasestage) {
  Fundebug.releasestage = releasestage;
}

function setUser(user) {
  Fundebug.user = user;
}

function setMetaData(metaData) {
  Fundebug.metaData = metaData;
}

function setFilters(filters) {
  Fundebug.filters = filters;
}

function setSilent(silent) {
  Fundebug.silent = silent;
}

function setSilentResource(silentResource) {
  Fundebug.silentResource = silentResource;
}

function setSilentHttp(silentHttp) {
  Fundebug.silentHttp = silentHttp;
}

function handleErr4Vue(vueObj) {
  vueObj.config.errorHandler = (err, vm, info) => {
    let componentName = formatComponentName(vm),
      propsData = vm.$options && vm.$options.propsData,
      metaData = Object.assign(
        {
          componentName: componentName,
          propsData: propsData,
          info: info,
        },
        Fundebug.metaData
      );

    Fundebug.notifyError(err, {
      metaData,
    });
  };
}

function disabledIgnoreScriptErr() {
  Fundebug.filters && Fundebug.filters.length > 0 && Fundebug.filters.splice(0, 1);
}

function notifyError(err, option) {
  Fundebug.notifyError(err, option);
}

function notify(name, msg, option) {
  Fundebug.notify(name, msg, option);
}

export default {
  setApikey: setApikey,
  setAppversion: setAppversion,
  setReleasestage: setReleasestage,
  setUser: setUser,
  setMetaData: setMetaData,
  setFilters: setFilters,
  setSilent: setSilent,
  setSilentResource: setSilentResource,
  setSilentHttp: setSilentHttp,
  handleErr4Vue: handleErr4Vue,
  notifyError: notifyError,
  notify: notify,
  version: '1.0.1',
};
