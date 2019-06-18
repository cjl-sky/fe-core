# 分享集成类库 Monitor.js

## 项目介绍

Mshare.js 封装了常见几种分享场景的逻辑, 让开发者一次性配置即可满足多种场景的使用.

目前支持以下分享场景:

- 从微信分享到外部;
- 从 QQ 客户端分享到外部;
- 从 QQ 浏览器分享到外部;
- 从 UC 浏览器分享到外部;
- 从妈网 App (孕管, 妈圈, 亲子记) 分享到外部.

## 相关开发人员

- 前端开发: [陈晓平](mailto:chenxp@demo.cn)

## 如何使用

下面只列出常见的使用方式, 更详细的内容请查阅相关 wiki.

```js
import MShare from 'fe-core/lib/mshare';

let mshare = new MShare({
  title: 'fe Share Demo',
  desc: '本页面用于展示 fe 团队的相关 Demo',
  link: window.location.href,
  imgUrl: '', // 默认设置为网站 logo
});

// 动态更新分享信息
mshare.updateConfig({
  title: 'fe Share Demo',
  desc: '本页面用于展示 fe 团队的相关 Demo',
  link: window.location.href,
  imgUrl: '', // 默认设置为网站 logo
});
```

## 相关 wiki

- Web 自定义分享 JS SDK (mshare.js) 使用指南: [http://wiki.corp.demo.cn/pages/viewpage.action?pageId=78198751](http://wiki.corp.demo.cn/pages/viewpage.action?pageId=78198751)

## 更新日志

[CHANGELOG.log](./CHANGELOG.md)
