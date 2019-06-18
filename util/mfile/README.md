# mfile.js 公用工具模块使用指南

## 前言

不少专题和独立的前端项目都有处理文件的需求, 最常见的莫过于将文件转换成 Base64 字符串并上传到 CDN 服务. 以后所有有关处理文件的逻辑会被集中到 mfile.js, 统一引用有利于减少编码的工作量, 集中到一个地方方便后期维护.

## 相关 wiki

* [两种常见的 mfile.js 使用场景](http://wiki.corp.demo.cn/pages/viewpage.action?pageId=78209194)

## 更新日志

[CHANGELOG.md](./CHANGELOG.md)

## fe-core/util/mfile 接口说明

* [fe-core/util/mfile](#module_fe-core/util/mfile)
  * [.version](#module_fe-core/util/mfile.version) : <code>String</code>
  * [.toBase64(file, [option])](#module_fe-core/util/mfile.toBase64) ⇒ <code>Promise</code>
  * [.upload(param)](#module_fe-core/util/mfile.upload) ⇒ <code>Promise</code>

<a name="module_fe-core/util/mfile.version"></a>

### fe-core/util/mfile.version : <code>String</code>

版本号, 用于 CHANGELOG.md 定位

**Kind**: static property of [<code>fe-core/util/mfile</code>](#module_fe-core/util/mfile)
<a name="module_fe-core/util/mfile.toBase64"></a>

### fe-core/util/mfile.toBase64(file, [option]) ⇒ <code>Promise</code>

转换文件为 base64 字符串
(自动根据 File 对象的文件类型进行处理, 如果是图片类型的文件, 会做压缩和角度修正后转换成 Base64, 如果是非图片类型文件, 直接转换成 Base64)

**Kind**: static method of [<code>fe-core/util/mfile</code>](#module_fe-core/util/mfile)
**Returns**: <code>Promise</code> - 返回 file 的 base64 字符串

| Param                | Type                 | Default           | Description                                                                                                                                                                                              |
| -------------------- | -------------------- | ----------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| file                 | <code>File</code>    |                   | 需要被转换成 base64 的 File 或 Blob 对象                                                                                                                                                                 |
| [option]             | <code>Object</code>  |                   | 如果 file 传入的是图片类型的文件, 会使用此参数对 file 进行处理                                                                                                                                           |
| [option.orientation] | <code>Boolean</code> | <code>true</code> | 配置是否自动根据图片文件的 Exif 信息修正旋转角度                                                                                                                                                         |
| [option.quality]     | <code>Number</code>  | <code>0.8</code>  | 配置内部调用 toDataURL 时的图片质量                                                                                                                                                                      |
| [option.*]           | <code>\*</code>      |                   | 可传入 'blueimp-load-image' 类库的所有配置, 最常用的例如设置 maxWidth 和 maxHeight 限制图片的最大宽度和高度, 以及上面的 orientation. [Options](https://github.com/blueimp/JavaScript-Load-Image#options) |

<a name="module_fe-core/util/mfile.upload"></a>

### fe-core/util/mfile.upload(param) ⇒ <code>Promise</code>

通过传入 Base64 字符串和七牛其他配置信息 (例如 token) 上传到 CDN 服务
(目前只考虑妈网七牛上传资源的场景, 如果有其他需求请扩展此方法)

**Kind**: static method of [<code>fe-core/util/mfile</code>](#module_fe-core/util/mfile)
**Returns**: <code>Promise</code> - 返回上传文件所在七牛服务的路径名

| Param                   | Type                | Default                     | Description                                                                                                                                                                                                |
| ----------------------- | ------------------- | --------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| param                   | <code>Object</code> |                             | 参数配置对象                                                                                                                                                                                               |
| param.baseURL           | <code>String</code> |                             | 七牛上传服务的 URL                                                                                                                                                                                         |
| param.token             | <code>String</code> |                             | 配置七牛上传服务的 token                                                                                                                                                                                   |
| param.base64            | <code>String</code> |                             | 配置上传文件的 base64 字符串                                                                                                                                                                               |
| [param.urlParam]        | <code>Object</code> |                             | 配置调用七牛上传服务 URL 的参数 (此对象的键值对都会被放入 URL 中, 小心使用, 七牛上传服务 URL 参数请参考 [Link](https://developer.qiniu.com/kodo/kb/1326/how-to-upload-photos-to-seven-niuyun-base64-code)) |
| [param.urlParam.putb64] | <code>String</code> | <code>&#x27;-1&#x27;</code> | 皮遏制文件大小, 传入 -1 表示文件大小以 http request body 为准                                                                                                                                              |
| [param.urlParam.key]    | <code>String</code> |                             | 配置文件上传到七牛服务的路径                                                                                                                                                                               |
| [param.urlParam.crc32]  | <code>String</code> |                             | 配置上传文件的 crc32 检验码, 一旦设置七牛服务端会根据此                                                                                                                                                    |
