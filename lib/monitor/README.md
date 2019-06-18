# 前端异常收集与监控类库 Monitor.js

## 项目介绍

Monitor.js 封装了接入 Fundebug 异常收集与监控平台的相关逻辑, 开发者可通过 Monitor.js 快速接入 Fundebug.

## 相关开发人员

- 前端开发: [陈晓平](mailto:chenxp@demo.cn)

## 如何使用

```js
import monitor from 'fe-core/lib/monitor';
import Vue from 'vue'; // 是否要引入 import 'vue', 请根据当前项目类型判断
monitor.setApikey('FUNDEBUG_API_KEY');
monitor.handleErr4Vue(Vue); // 是否要调用 handleErr4Vue接口, 请根据当前项目类型判断
```

## 相关 wiki

- 前端异常收集与监控类库 monitor.js 使用指南: [http://wiki.corp.demo.cn/pages/viewpage.action?pageId=78199450](http://wiki.corp.demo.cn/pages/viewpage.action?pageId=78199450)

## 更新日志

[CHANGELOG.log](./CHANGELOG.md)
