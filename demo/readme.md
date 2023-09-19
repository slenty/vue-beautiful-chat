安装npm工具

在demo路径下执行npm install

成功后执行npm run dev

然后在浏览器中即可访问(上面命令执行成功后会显示网址路径)

部署：
1. npm run build 构建前端目标文件。然后把dist文件夹放到linux中（linux需要配置nginx）。nginx配置成访问dist文件夹下的index.html即可
2. 前端访问ip地址或者域名（路由到nginx服务器）