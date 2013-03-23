## 介绍

此版本的 Migs 是使用 **Node.js** 和 **Mongodb** 开发的一个图片管理程序，来源于 @LOO2K 开发的 PHP 版本 Migs [地址](http://loo2k.com/blog/sae-migs/)，并以移植项目来学习 Node.js 的使用，代码仅供研究，不建议实际使用；

## TODO

-   灯箱图片展示
-   文件上传优化（HTML, Drag, Flash）
-   图片切换
- √ 排序功能存在 bug
-   图片分享
-   喜欢功能
-   第三方评论功能（多说, disqus, etc...）
-   图片 EXIF 信息读取
- √ 用户 Gravatar 头像支持
-   第三方服务接入
-   tag, cat 支持
-   bookmark 上传
- √ 优化前端图片展示
- √ 添加对 sea.js 的支持
- etc

## changlogs

### 2013年3月22日

 - 添加引用 underscore 模块

### 2013年3月21日

 - 修复一个登录错误处理的错误

### 2013年3月20日

 - 增加 Google Fonts Api : Open Sans
 - 优化上传组件，为上传模块准备
 - 增加前端 tab 插件

### 2013年3月19日

 - 增加 mimes helper，对上传文件的 mime 值进行检查

### 2013年3月18日

 - 准备好了 tag 的接口，为前端 MVC 做准备
 - 图片输出增加 tags 输出

### 2013年3月14日

 - 添加 Tag 和 TagRelation 表，Categories 以 tag_type 属性区分

### 2013年3月13日

 - 分页样式优化
 - 获取图片增加关联用户查询输出
 - 添加 EventProxy 模块的支持
 - 添加 helper 目录放一些常用的函数模块
 - 转移 controller 文件夹中的 upload.js 到 helper 中的 photo.js
 - 修改 dbsource 文件夹名称为 db
 - 添加 Gravatar 的支持
 - 分页错误显示总页数 bug 修复

### 2013年3月12日

 - 去除 app.js 中的 ndir 模块依赖
 - 分页添加 base_url 处理链接
 - photo.js 处理器 json 输出

### 2013年3月11日

 - 去除 nidr 模块依赖，使复制图片函数支持跨磁盘操作
 - 添加图片缩略图方法
 - 添加图片链接获取方法
 - 更新了 models 模块中获取图片的方法
 - 对图片列表增加分页功能

### 2013年3月10日

 - 添加对 sea.js 的支持，前端使用 sea.js 进行模块开发
 - 修复删除图片时路径出错的问题

### 2013年3月06日

 - 新建项目
 - 添加 package.json 以及 README.md 文档

## License

( The MIT License )

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
"Software"), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.