# Servedoor 平台（通用说明）

Servedoor 是一个完整的餐饮下单平台，包含：

- 后端 API（FastAPI + MongoDB）
- Web 前端（React）
- Flutter 客户端应用

## 快速启动

1. 启动后端：

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8001
```

2. 启动 Web 前端：

```bash
cd frontend
npm install
npm start
```

3. 启动 Flutter 客户端：

```bash
cd "custmer app"
flutter pub get
flutter run
```

## 核心功能

- OTP 登录认证
- 餐厅与菜单浏览
- 购物车与订单
- 个人资料与地址
- 收藏、图片库、评价
- 支付方式与支付校验

## 重要文件

- 后端环境模板：backend/.env.example
- 移动端 API 地址配置：custmer app/lib/utils/ServedoorConstant.dart
