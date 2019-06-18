# fe-core

## 说明

fe-core 存放前端项目公用类库、组件代码

## 安装

```bash
npm install git+ssh://git@github.com:cjl-sky/fe-core.git --save
```

## 开发环境

```bash
npm run dev
```

开发环境下，当源文件或者 test case 发生变化时，会自动运行单测。

## 单元测试

```bash
npm test
```

## 注意事项

- 迭代时要维护好 unit test
- 提交代码后要注意 CI 平台是否有单测失败反馈

## fe-core/lib 构建说明

构建出来的文件支持 umd 规范.

### 命令行

```bash
# 在当前目录下运行命令
node monkey.js --lib 类库文件夹名称
# 例如构建 mshare
node monkey.js --lib mshare
```

### 配置参数

通过在类库文件夹下新建一个 lib-info.json 文件来配置.

| 参数        | 类型   | 必选 | 默认值         | 可选值                     | 说明                                      |
| ----------- | ------ | ---- | -------------- | -------------------------- | ----------------------------------------- |
| version     | string | 是   | 无             | 任一符合规范的版本号字符串 | 配置输出文件的版本号                      |
| global-name | string | 否   | 类库文件夹名称 | 任一字符串                 | 配置暴露在 window 上作为全局对象的 key 值 |

lib-info.json 配置

```json
{
  "version": "1.1.2",
  "global-name": "MShare"
}
```
