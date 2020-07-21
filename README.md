# Easy EDI v1.7.2

### 本地开发部署:

创建`.env.local`文件并添加EDI主目录, 比如:
```
EDI_DIR=F:\tmp\test
```
- `git clone` 复制该repo.
- `npm install` 安装依赖.
- `npm run dev` 启动程序.

访问[http://localhost:3000](http://localhost:3000)查看工具页面.

### 生产模式部署:
- `git pull origin master`
- `npm run pm2:start:prod` 或 `pm2:restart:prod`.

### 备注:
- 生产模式默认端口为`80`.
