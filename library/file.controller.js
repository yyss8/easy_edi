const EDI_PATH = process.env.EDI_DIR;
const fs = require('fs');
const path = require('path');
const moment = require('moment');
const archiver = require('archiver');
const ExcelParser = require('./ExcelParser');
const ExcelGenerator = require('./ExcelGenerator');
import db from './database.connection';

require('moment-timezone');
const MOMENT_FORMAT = 'YYYY-MM-DD HH:mm:ss';
const MOMENT_TIMEZONE = 'America/New_York';

// 文档类型所属路径.
const TYPE_MAPPING = {
  // in
  '850': '\\edi\\850-excel',
  '754': '\\edi\\754-excel',
  '997': '\\ediout-json\\997',
  // out
  '753': '\\edi\\753-excel',
  '856': '\\edi\\856-excel',
  label: '\\edi\\label',
  'label-excel': '\\edi\\label-excel',
  // 通知
  notify: '\\错误信息',
  // 日志
  logs: '\\文件日志',
};

/**
 * 加载文件
 *
 * @param {string} type
 *   目录类型.
 * @param {Object} params
 *   加载参数.
 *
 * @return {Object[]}
 *   指定类型目录下的文件数组.
 */
async function loadFiles(type, params = {}) {
  const typeFullPath = getFilePath(params.fileType, type);

  if (!fs.existsSync(typeFullPath)) {
    return [];
  }

  const files = fs.readdirSync(typeFullPath);
  const getDetail = params.getDetail === true && typeof ExcelParser[`parse${type.replace('-', '_')}`] === 'function';
  const context = {};

  switch (type) {
    case '850':
    case 'label-excel':
      context.products = {};
      try {
        const products = await db('ed_product').select('asin', 'product_title');

        products.forEach((product) => {
          context.products[product.asin] = product.product_title;
        });
      } catch (e) {
        console.log(e);
      }
      break;
  }

  let scannedFiles = [];

  files.forEach((file) => {
    scannedFiles.push(getFileData(file, params.fileType, type, getDetail, context));
  });

  if (params.shouldSort !== false) {
    scannedFiles = sortFiles(scannedFiles, params.sorting);
  }

  if (params.shouldFilter !== false) {
    scannedFiles = filterFiles(scannedFiles, {
      type,
      ...params,
    });
  }

  return scannedFiles;
}

/**
 * 获取单个文件数据.
 *
 * @param {string} fileName
 *   文件名.
 * @param {string} dirType
 *   文件路径类型.
 * @param {string} type
 *   文档类型。
 * @param {boolean} getDetail
 *   是否解析文件并获取更多数据.
 *
 * @return {Object|null}
 */
function getFileData(fileName, dirType, type, getDetail = false, context = {}) {
  const filePath = getFilePath(dirType, type, fileName);

  if (!fs.existsSync(filePath)) {
    return null;
  }

  const stat = fs.statSync(filePath);
  let fileData = {
    name: fileName,
    modified: moment(stat.mtime).tz(MOMENT_TIMEZONE).format(MOMENT_FORMAT),
    created: moment(stat.birthtime).tz(MOMENT_TIMEZONE).format(MOMENT_FORMAT),
    size: stat.size,
  };

  if (getDetail) {
    fileData = ExcelParser[`parse${type.replace('-', '_')}`](filePath, fileData);
  }

  switch (type) {
    case '754':
      // 部分数据需要从850调取.
      const fileName850 = `${fileData.po_number}.xlsx`;
      const path850 = getFilePath(dirType, '850', fileName850);

      if (fs.existsSync(path850)) {
        const data850 = getFileData(fileName850, dirType, '850', true) || {};

        fileData = {
          ...data850,
          ...fileData,
        };
      }
      break;

    case '850':
      // 获取所属商品描述.
      const productMap = context.products || {};

      if (Array.isArray(fileData.products)) {
        fileData.products.forEach((product) => {
          if (Boolean(productMap[product.asin])) {
            product.product_title = productMap[product.asin];

            // 如果一个商品已存在于数据库, 将850标记为有描述.
            fileData.has_product_title = true;
          } else {
            product.product_title = '';
          }
        });
      }

      if (!fileData.has_product_title) {
        fileData.has_product_title = false;
      }
      break;

    case 'label-excel':
      // 获取所属商品描述.
      const labelProductMap = context.products || {};

      if (Boolean(fileData.asin) && Boolean(labelProductMap[fileData.asin])) {
        fileData.product_title = labelProductMap[fileData.asin];
      } else {
        fileData.product_title = '';
      }
      break;

    default:
    // Nothing.
  }

  return fileData;
}

/**
 * 获取压缩打包后的文档stream.
 *
 * @param {string} dirType
 *   目录类型 (edi/archive).
 * @param {string} fileType
 *   文档类型.
 * @param {string[]} fileNames
 *   要打包的文件.
 *
 * @return {Archiver}
 */
async function getZipWriteStream(dirType, fileType, fileNames) {
  const archive = archiver('zip', {
    zlib: { level: 9 },
  });

  const files = await loadFiles(dirType, {
    fileType,
  });

  files.forEach((file) => {
    if (fileNames.indexOf(file.name) === -1) {
      return;
    }

    const filePath = fileType === 'edi' ? getRealPath(dirType, file.name) : getArchivePath(dirType, file.name);
    archive.file(filePath, {
      name: file.name,
    });
  });

  return archive;
}

/**
 * 排序文件
 *
 * @param {Object[]} files
 *   文件数组.
 * @param {string} sorting
 *   排序方式.
 *
 * @return {Object[]}
 *   排序后的文件.
 */
function sortFiles(files, sorting = 'name_ASC') {
  const parts = sorting.split('_');
  const sortKey = parts[0] || 'name';
  const sortMethod = parts[1] || 'ASC';

  return files.sort((a, b) => {
    switch (sortKey) {
      case 'modified':
      case 'created':
        const timeA = moment(a[sortKey], MOMENT_FORMAT);
        const timeB = moment(b[sortKey], MOMENT_FORMAT);

        if (sortMethod === 'ASC') {
          return timeA.diff(timeB);
        } else {
          return timeB.diff(timeA);
        }

      case 'name':
      default:
        const lowerNameA = a.name.toLowerCase();
        const lowerNameB = b.name.toLowerCase();

        if (sortMethod === 'ASC') {
          return lowerNameA > lowerNameB ? 1 : lowerNameA < lowerNameB ? -1 : 0;
        } else {
          return lowerNameB > lowerNameA ? 1 : lowerNameB < lowerNameA ? -1 : 0;
        }
    }
  });
}

/**
 * 筛选文件.
 *
 * @param {Object[]} files
 * @param {Object} params
 *
 * @return {Object[]}
 *   筛选后的文件.
 */
function filterFiles(files, params) {
  const filteredFiles = [];

  files.forEach((file) => {
    // 关键字.
    if (Boolean(params.keyword)) {
      if (!file.name.includes(params.keyword)) {
        return;
      }
    }

    // PO日期.
    if (Boolean(params.poDate) && params.poDate !== file.date) {
      return;
    }

    // PO # (部分类型有效)
    if (Boolean(params.poKeyword)) {
      if (!file.po_number.includes(params.poKeyword)) {
        return;
      }
    }

    // 不同类型独有的筛选.
    switch (params.type) {
      case '754':
        if (Boolean(params.arn)) {
          if (!file.arn.includes(params.arn)) {
            return;
          }
        }

        if (Boolean(params.carrier)) {
          if (!file.carrier.includes(params.carrier)) {
            return;
          }
        }
        break;
    }

    filteredFiles.push(file);
  });

  return filteredFiles;
}

/**
 * 上传文件并检查是否被EDI处理.
 *
 * @param {string} tempPath
 *   上传后的临时文件路径.
 * @param {string} name
 *   文件名
 * @param {string} type
 *   文件所属类型.
 */
function uploadFile(tempPath, name, type) {
  const realPath = getRealPath(type);

  if (!fs.existsSync(realPath)) {
    fs.mkdirSync(realPath);
  }

  // 不允许跨硬盘移动, 先复制再删除.
  fs.copyFileSync(tempPath, `${realPath}\\${name}`);

  // 创建归档文件作为上传记录.
  const archivePath = getArchivePath(type);
  if (!fs.existsSync(archivePath)) {
    fs.mkdirSync(archivePath);
  }

  const archiveFilePath = `${archivePath}\\${name}`;
  const copyingArchiveFilePath = getUniqueFilePath(archiveFilePath);
  fs.copyFileSync(tempPath, copyingArchiveFilePath);

  // 删除tmp文件.
  fs.unlinkSync(tempPath);
}

/**
 * 介于文件目录可能会重名, 加入时间防止重名.
 *
 * @param {string} filePath
 *   原文件路径.
 *
 * @return {string}
 *   新文件路径.
 */
function getUniqueFilePath(filePath) {
  if (!fs.existsSync(filePath)) {
    return filePath;
  }

  const parsedFilePath = path.parse(filePath);

  return `${parsedFilePath.dir}\\${parsedFilePath.name}-${moment().tz(MOMENT_TIMEZONE).format('YYYYMMDD-HHmmss')}${
    parsedFilePath.ext
  }`;
}

/**
 * 获取EDI文件路径.
 *
 * @param {string} type
 *   文件类型
 * @param {string} fileName
 *   文件名
 *
 * @return {string}
 *   路径.
 */
function getRealPath(type, fileName = '') {
  const typeDir = TYPE_MAPPING[type];
  const typeFullPath = `${EDI_PATH}${typeDir}`;

  if (!fileName || fileName === '') {
    return typeFullPath;
  }

  return `${typeFullPath}\\${fileName}`;
}

/**
 * 获取archive路径.
 *
 * @param {string} type
 *   文件类型.
 * @param {string} fileName
 *   文件名.
 *
 * @return {string}
 */
function getArchivePath(type, fileName = '') {
  const archiveDir = `${EDI_PATH}\\archive\\${type}`;

  if (!fileName || fileName === '') {
    return archiveDir;
  }

  return `${archiveDir}\\${fileName}`;
}

/**
 * 获取已删除文件路径.
 *
 * @param {string} type
 *   文件类型.
 * @param {string} fileName
 *   文件名.
 *
 * @return {string}
 */
function getDeletedPath(type, fileName = '') {
  const archiveDir = `${EDI_PATH}\\delete\\${type}`;

  if (!fileName || fileName === '') {
    return archiveDir;
  }

  return `${archiveDir}\\${fileName}`;
}

/**
 * 归档文件.
 *
 * @param {string} fileName
 *   文件名
 * @param {string} type
 *   文件所属类型.
 * @param {boolean} deleteOrg
 *   是否删除源文件.
 */
function archiveFile(fileName, type, deleteOrg = false) {
  const typeArchiveDirectory = getArchivePath(type);

  // 如果目录不存在则创建.
  if (!fs.existsSync(typeArchiveDirectory)) {
    fs.mkdirSync(typeArchiveDirectory);
  }

  const realPath = getRealPath(type, fileName);

  fs.copyFileSync(realPath, getUniqueFilePath(`${typeArchiveDirectory}\\${fileName}`));

  // 删除原文件.
  if (deleteOrg) {
    fs.unlinkSync(realPath);
  }
}

/**
 * 将文件移动至删除目录.
 *
 * @param {string} fileName
 *   文件名
 * @param {string} type
 *   文件所属类型.
 * @param {boolean} deleteOrg
 *   是否删除源文件.
 */
function deleteFile(fileName, type) {
  const typeDeleteDirectory = getDeletedPath(type);

  // 如果目录不存在则创建.
  if (!fs.existsSync(typeDeleteDirectory)) {
    fs.mkdirSync(typeDeleteDirectory);
  }

  const archivePath = getArchivePath(type, fileName);

  // 复制文件至删除目录.
  fs.copyFileSync(archivePath, getUniqueFilePath(`${typeDeleteDirectory}\\${fileName}`));

  // 删除原文件.
  fs.unlinkSync(archivePath);

  return true;
}

/**
 * 通用获取文件路径.
 *
 * @param {string} dirType
 *   目录类型 (edi/archive).
 * @param {string} type
 *   文档类型
 * @param {string} fileName
 *   文件名
 *
 * @return {string}
 *   文件所属路径.
 */
function getFilePath(dirType, type, fileName = '') {
  switch (dirType) {
    case 'archive':
      return getArchivePath(type, fileName);

    case 'delete':
      return getDeletedPath(type, fileName);

    case 'edi':
    default:
      return getRealPath(type, fileName);
  }
}

/**
 * 生成Excel文档.
 *
 * @param {Object} fileData
 *   相关数据.
 * @param {string} excelType
 *   文档类型.
 * @param {boolean} submit
 *   是否为直接提交.
 * @param {string} titleOverride
 *   覆盖标题.
 *
 * @return {ReadStream|boolean|null}
 */
async function generateExcel(fileData, excelType, submit, titleOverride = '') {
  if (excelType === 'label-excel') {
    return ExcelGenerator.generateLabelExcel(fileData, submit, titleOverride);
  } else if (excelType === '753') {
    return await ExcelGenerator[`generate${excelType}`](fileData, submit, titleOverride);
  }

  if (typeof ExcelGenerator[`generate${excelType}`] !== 'function') {
    return false;
  }

  return ExcelGenerator[`generate${excelType}`](fileData, submit, titleOverride);
}

module.exports = {
  archiveFile,
  loadFiles,
  uploadFile,
  getRealPath,
  deleteFile,
  getArchivePath,
  getZipWriteStream,
  getFileData,
  getFilePath,
  generateExcel,
};
