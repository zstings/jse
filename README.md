# JSE

<!-- javascript 和 typescript 文件在保存时自动压缩混淆加密，并生成新的文件 -->
javascript 文件 压缩混淆加密，并生成新的文件

插件激活时注册JSE1和JSE2两个按钮在任务栏

JSE1 使用 terser + packer

JSE2 使用 jshaman + packer

## 插件提供两个基础设置值

## identificationIdentifier 标识

识别标识符, 默认.bak, 源文件必须为.bak.js 或者.bak.ts 的后缀插件才会激活开启压缩

```
a.bak.js -> a.min.js #默认
a.f.js -> a.min.js #修改标识符.f
```

## generateIdentifier 标识

生成标识符, 默认.min, 生成的文件会以.min.js 结尾

```
a.bak.js -> a.min.js
```

如果两个标识符都设置空，转换后的文件就是当前文件。
