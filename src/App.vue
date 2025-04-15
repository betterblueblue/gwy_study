<template>
  <el-container class="app-wrapper">
    <el-aside width="200px" class="sidebar">
      <el-menu
        :router="true"
        class="el-menu-vertical"
        background-color="#304156"
        text-color="#bfcbd9"
        active-text-color="#409EFF">
        <el-menu-item index="/">
          <el-icon><House /></el-icon>
          <span>首页</span>
        </el-menu-item>
        <el-menu-item index="/practice">
          <el-icon><Edit /></el-icon>
          <span>题目练习</span>
        </el-menu-item>
        <el-menu-item index="/study-plan">
          <el-icon><Calendar /></el-icon>
          <span>学习计划</span>
        </el-menu-item>
        <el-menu-item index="/mistakes">
          <el-icon><Warning /></el-icon>
          <span>错题本</span>
        </el-menu-item>
        <el-menu-item index="/notes">
          <el-icon><Notebook /></el-icon>
          <span>学习笔记</span>
        </el-menu-item>
      </el-menu>
    </el-aside>
    <el-container class="main-container">
      <el-header height="60px" class="header">
        <h2 class="title">公务员考试学习管理系统</h2>
      </el-header>
      <el-main class="main-content">
        <router-view />
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup>
import { House, Edit, Calendar, Warning, Notebook } from '@element-plus/icons-vue'
</script>

<style scoped>
.app-wrapper {
  height: 100vh;
}

.sidebar {
  background-color: #304156;
  height: 100%;
}

.el-menu-vertical {
  border-right: none;
}

.header {
  background-color: #fff;
  border-bottom: 1px solid #e6e6e6;
  display: flex;
  align-items: center;
}

.title {
  margin: 0;
  color: #303133;
  font-size: 18px;
}

.main-container {
  height: 100%;
}

.main-content {
  background-color: #f0f2f5;
  height: calc(100% - 60px);
}
</style>