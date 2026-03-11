#!/bin/bash

# Maersk Automation System - 一键部署脚本
# 使用方法: ./deploy.sh

set -e

echo "=========================================="
echo "Maersk Automation System - Docker部署"
echo "=========================================="
echo ""

# 检查Docker是否安装
if ! command -v docker &> /dev/null; then
    echo "❌ Docker未安装，请先安装Docker"
    echo "   安装指南: https://docs.docker.com/get-docker/"
    exit 1
fi

# 检查Docker Compose是否安装
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose未安装，请先安装Docker Compose"
    echo "   安装指南: https://docs.docker.com/compose/install/"
    exit 1
fi

echo "✅ Docker环境检查通过"
echo ""

# 获取服务器IP
SERVER_IP=$(hostname -I | awk '{print $1}')

echo "📋 部署信息:"
echo "   服务器IP: $SERVER_IP"
echo "   前端地址: http://$SERVER_IP"
echo "   VNC地址: http://$SERVER_IP:6080/vnc.html"
echo ""

# 创建必要目录
echo "📁 创建数据目录..."
mkdir -p data logs

# 构建并启动
echo "🔨 构建Docker镜像..."
docker-compose build --no-cache

echo "🚀 启动服务..."
docker-compose up -d

echo ""
echo "⏳ 等待服务启动..."
sleep 10

# 检查服务状态
echo ""
echo "📊 服务状态:"
docker-compose ps

echo ""
echo "=========================================="
echo "✅ 部署完成!"
echo "=========================================="
echo ""
echo "🌐 访问地址:"
echo "   前端界面: http://$SERVER_IP"
echo "   VNC画面: http://$SERVER_IP:6080/vnc.html"
echo ""
echo "📖 常用命令:"
echo "   查看日志: docker-compose logs -f"
echo "   重启服务: docker-compose restart"
echo "   停止服务: docker-compose down"
echo ""
echo "⚠️  注意: 首次启动可能需要1-2分钟加载浏览器"
echo ""
