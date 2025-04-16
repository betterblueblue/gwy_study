const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const { promisify } = require('util');
const execAsync = promisify(exec);

// 配置备份目录
const BACKUP_DIR = path.join(__dirname, '../backups');

// 确保备份目录存在
if (!fs.existsSync(BACKUP_DIR)) {
  fs.mkdirSync(BACKUP_DIR, { recursive: true });
}

// 生成备份文件名
const getBackupFileName = () => {
  const date = new Date();
  return `backup_${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}${String(date.getDate()).padStart(2, '0')}_${String(date.getHours()).padStart(2, '0')}${String(date.getMinutes()).padStart(2, '0')}.gz`;
};

// 执行数据库备份
const backupDatabase = async (dbName, backupPath) => {
  try {
    const command = `mongodump --db ${dbName} --archive="${backupPath}" --gzip`;
    await execAsync(command);
    console.log(`数据库备份成功：${backupPath}`);
    return true;
  } catch (error) {
    console.error('数据库备份失败：', error);
    return false;
  }
};

// 从备份文件恢复数据库
const restoreDatabase = async (dbName, backupPath) => {
  try {
    const command = `mongorestore --db ${dbName} --archive="${backupPath}" --gzip`;
    await execAsync(command);
    console.log(`数据库恢复成功：${backupPath}`);
    return true;
  } catch (error) {
    console.error('数据库恢复失败：', error);
    return false;
  }
};

// 获取所有备份文件列表
const getBackupsList = () => {
  try {
    return fs.readdirSync(BACKUP_DIR)
      .filter(file => file.startsWith('backup_') && file.endsWith('.gz'))
      .map(file => ({
        fileName: file,
        path: path.join(BACKUP_DIR, file),
        date: new Date(file.slice(7, 15).replace(/(.{4})(.{2})(.{2})/, '$1-$2-$3'))
      }))
      .sort((a, b) => b.date - a.date);
  } catch (error) {
    console.error('获取备份列表失败：', error);
    return [];
  }
};

// 删除旧的备份文件
const cleanOldBackups = (keepCount = 5) => {
  try {
    const backups = getBackupsList();
    if (backups.length > keepCount) {
      backups.slice(keepCount).forEach(backup => {
        fs.unlinkSync(backup.path);
        console.log(`删除旧备份文件：${backup.fileName}`);
      });
    }
  } catch (error) {
    console.error('清理旧备份文件失败：', error);
  }
};

// 创建新的备份
const createBackup = async (dbName) => {
  const backupPath = path.join(BACKUP_DIR, getBackupFileName());
  const success = await backupDatabase(dbName, backupPath);
  if (success) {
    cleanOldBackups();
  }
  return success;
};

module.exports = {
  createBackup,
  restoreDatabase,
  getBackupsList,
  BACKUP_DIR
};