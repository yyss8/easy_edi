# Easy EDI v2.1.1

### 所需环境:

- 系统: `Windows`.
- Nodejs `>=` `14.x`.
- Mysql `>=` `5.7.x`.

### 本地开发部署:

- `git clone` 复制该 repo.
- `npm install` 安装依赖.
- `cp .env.example .env.local` 复制`.env.example`文件为`.env.local`并填入所需本地 EDI 目录地址/数据库参数.
- `npm run dev` 启动程序.

访问[http://localhost:3000](http://localhost:3000)查看工具页面.

### 生产模式部署:

- `git pull origin master`
- `npm run pm2:start:prod`.

### 备注:

- 生产模式默认端口为`80`, 本地为`3000`.
