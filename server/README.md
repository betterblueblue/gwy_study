# 公务员考试学习系统后端服务

## 环境要求

- Node.js (v14+)
- MongoDB (v4+)

## 安装步骤

1. 安装MongoDB
   - 下载并安装MongoDB
   - 启动MongoDB服务

2. 安装项目依赖
   ```bash
   cd server
   npm install
   ```

3. 启动服务器
   ```bash
   npm run dev
   ```

服务器将在 http://localhost:3000 启动

## API接口

### 获取题目列表
GET /api/questions

查询参数：
- subject: 科目（行测/申论）
- type: 题型（言语理解/数量关系/判断推理/资料分析）

### 添加新题目
POST /api/questions

请求体格式：
```json
{
  "type": "言语理解",
  "content": "题目内容",
  "options": [
    {"key": "A", "content": "选项A内容"},
    {"key": "B", "content": "选项B内容"},
    {"key": "C", "content": "选项C内容"},
    {"key": "D", "content": "选项D内容"}
  ],
  "answer": "A",
  "subject": "行测"
}
```