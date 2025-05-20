# Slackr - 实时通讯平台

[English](README.md) | [中文](README.zh.md)

## 项目概述

Slackr 是一个受 Slack 启发的实时通讯平台，使用原生 JavaScript 构建。这个项目展示了我在不使用框架的情况下，使用现代网页技术构建复杂 Web 应用的能力。

## 已实现功能

### 1. 用户认证与管理
- 用户注册和登录系统
- 支持照片上传的个人资料管理
- 带安全验证的密码管理
- 用户友好的错误提示系统

### 2. 频道管理
- 创建和加入公开/私密频道
- 查看频道详情和成员列表
- 编辑频道信息（名称、描述）
- 退出频道功能

### 3. 实时消息
- 在频道中发送和接收消息
- 编辑和删除自己的消息
- 使用表情符号的消息反应功能
- 消息置顶功能
- 消息分页

### 4. 多用户功能
- 带照片和个人简介的用户资料
- 邀请用户加入频道
- 查看其他用户资料
- 新消息实时更新

### 5. 媒体支持
- 消息中的照片上传和分享
- 带模态框的图片预览
- 缩略图生成

## 技术实现

### 前端技术
- 原生 JavaScript (ES6+)
- HTML5 & CSS3
- Fetch API 用于 HTTP 请求
- Local Storage 用于数据持久化
- DOM 操作
- 事件处理
- 基于 Promise 的异步操作

### 后端集成
- RESTful API 集成
- JWT 认证
- 文件上传处理
- 实时数据同步

### 解决的关键技术挑战
1. 不使用框架构建单页应用
2. 使用轮询实现实时更新
3. 在没有状态管理库的情况下管理复杂状态
4. 处理文件上传和图片处理
5. 创建响应式和可访问的用户界面

## 技术栈

### 编程语言
- JavaScript (ES6+)
- HTML5
- CSS3

### 前端技术
- 原生 JavaScript（无框架）
- Fetch API
- Local Storage API
- DOM API
- File API
- Canvas API（用于图片处理）

### 后端技术
- Node.js
- Express.js
- JSON Web Tokens (JWT)
- 文件系统 (fs) 模块
- HTTP/HTTPS 模块

### 开发工具
- npm（Node 包管理器）
- http-server（本地开发服务器）
- Git（版本控制）

### API 和服务
- RESTful API 接口
- 文件上传接口
- 认证接口
- 实时数据轮询

### 数据存储
- JSON 文件存储
- Local Storage 客户端缓存
- Session Storage 临时数据存储

### 安全特性
- JWT 认证
- 密码加密
- 输入验证
- XSS 防护
- CORS 实现

## 开始使用

### 环境要求
- Node.js (v14 或更高版本)
- npm (v6 或更高版本)

### 安装步骤

1. 克隆仓库：
```bash
git clone git@github.com:AnnaWu23/Slackr.git
```

2. 安装后端依赖：
```bash
cd backend
npm install
```

3. 启动后端服务器：
```bash
npm start
```

4. 在新的终端中启动前端服务器：
```bash
cd frontend
npx http-server -p 8080
```

5. 在浏览器中访问：
```
http://localhost:8080
```

## 项目结构
```
slackr/
├── frontend/           # 前端应用
│   ├── src/           # 源代码
│   ├── styles/        # CSS 文件
│   └── index.html     # 主 HTML 文件
├── backend/           # 后端服务器
│   ├── src/          # 服务器源代码
│   └── database.json # 数据库文件
└── README.md         # 项目文档
```

## 学习成果

通过构建这个项目，我获得了：
1. 对原生 JavaScript 和 DOM 操作的深入理解
2. 构建复杂单页应用的经验
3. RESTful API 集成的知识
4. 实时 Web 应用概念的理解
5. 文件上传和媒体处理的技能
6. 响应式设计和可访问性的经验

## 未来改进

1. 实现 WebSocket 用于实时更新
2. 添加消息端到端加密
3. 实现消息搜索功能
4. 支持更多媒体类型
5. 实现用户在线状态指示器

## 许可证

本项目仅用于演示目的。 