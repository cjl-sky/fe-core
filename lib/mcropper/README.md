# 前端异常收集与监控类库 MCropper.js

## 项目介绍

MCropper.js 进一步封装了 cropperjs 截图插件的逻辑, 并对图片做了一些处理, 减少开发者每次使用截图插件都需要手动引入相关类库和写重复代码的工作.

## 相关开发人员

- 前端开发: [陈晓平](mailto:chenxp@demo.cn)

## 如何使用

下面只列出常见的使用方式, 更详细的内容请查阅相关 wiki.

```js
import MCropper from 'fe-core/lib/mcropper';

changeInput(e) {
    if (this.mCropperIns) {
        this.mCropperIns.destroy && this.mCropperIns.destroy();
        this.mCropperIns = null;
    }
    let file = e.target.files[0];
    if (file) {
        let options = {
            round: this.isRoundCrop,
            cropperJS: {},  // cropperJS 这个对象支持配置 cropperjs 插件的所有参数
            // injectElementID: '#avatar-img', // 如果配置 injectElementID, 将会使用 ID 对应的元素区域作为裁剪的工作区域
        };
        if (this.isDirectCrop) {
            options.injectElementID = '#avatar-img';
            options.cropperJS.viewMode = 3;
        }
        // 如果没有设置 injectElementID, 需要配置 callback4OK 属性作为点击 "确认" 按钮的回调
        options.cropperJS.callback4OK = (croppedCanvas) => {
            this.avatarImg = croppedCanvas.toDataURL('image/jpeg');
        };
        // 如果没有设置 injectElementID, 需要配置 callback4Cancel 属性作为点击 "取消" 按钮的回调
        options.cropperJS.callback4Cancel = () => {
            console.log('callback4Cancel');
        };
        this.mCropperIns = new MCropper(file, options);
    }
}
```

## 相关 wiki

- 图片裁剪类库 mcropper.js 使用指南: [http://wiki.corp.demo.cn/pages/viewpage.action?pageId=78199930](http://wiki.corp.demo.cn/pages/viewpage.action?pageId=78199930)

## 更新日志

[CHANGELOG.log](./CHANGELOG.md)
