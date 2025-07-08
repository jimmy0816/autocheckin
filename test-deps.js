console.log('测试依赖安装...');

try {
    // 测试puppeteer
    const puppeteer = require('puppeteer');
    console.log('✅ puppeteer 导入成功');
    
    // 测试express
    const express = require('express');
    console.log('✅ express 导入成功');
    
    // 测试dotenv
    const dotenv = require('dotenv');
    console.log('✅ dotenv 导入成功');
    
    console.log('🎉 所有依赖测试通过！');
} catch (error) {
    console.error('❌ 依赖测试失败:', error.message);
    process.exit(1);
} 