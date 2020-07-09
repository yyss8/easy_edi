const EDI_PATH = process.env.EDI_DIR;
const fs = require('fs');
const path = require('path');
const moment = require('moment');
const archiver = require('archiver');

require('moment-timezone');
const MOMENT_FORMAT = 'YYYY-MM-DD HH:mm:ss';
const MOMENT_TIMEZONE = 'America/New_York';

const TYPE_MAPPING = {
	// in
	'850': '\\edi\\850-excel',
	'754': '\\edi\\754-excel',
	'997': '\\ediout-json\\997',
	// out
	'753': '\\edi\\753-excel',
	'856': '\\edi\\856-excel',
	'label': '\\edi\\label',
	'label-excel': '\\edi\\label-excel',
	// error
	'error': '\\错误信息',
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
function loadFiles(type, params = {}) {
	let typeFullPath;

	switch (params.fileType) {
		case 'archive':
			typeFullPath = getArchivePath(type);
			break;

		case 'edi':
		default:
			typeFullPath = getRealPath(type);
	}

	if (!fs.existsSync(typeFullPath)) {
		return [];
	}

	const files = fs.readdirSync(typeFullPath);
	let scannedFiles = [];

	files.forEach(file => {
		const stat = fs.statSync(`${typeFullPath}\\${file}`);
		scannedFiles.push({
			name: file,
			modified: moment(stat.mtime).tz(MOMENT_TIMEZONE).format(MOMENT_FORMAT),
			created: moment(stat.birthtime).tz(MOMENT_TIMEZONE).format(MOMENT_FORMAT),
			size: stat.size,
		});
	});

	scannedFiles = sortFiles(scannedFiles, params.sorting);
	scannedFiles = filterFiles(scannedFiles, params);

	return scannedFiles;
}

/**
 *
 * @param dirType
 * @param fileType
 * @param fileNames
 *
 * @return {Archiver}
 */
function getZipWriteStream(dirType, fileType, fileNames) {
	const archive = archiver('zip', {
		zlib: { level: 9 },
	});

	const files = loadFiles(dirType, {
		fileType,
	});

	files.forEach(file => {
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

	files.forEach(file => {
		if (Boolean(params.keyword)) {
			if (!file.name.includes(params.keyword)) {
				return;
			}
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
	const copyingArchiveFilePath = getUniqueArchiveFilePath(archiveFilePath);
	fs.copyFileSync(tempPath, copyingArchiveFilePath);

	// 删除tmp文件.
	fs.unlinkSync(tempPath);
}

/**
 * 介于归档文件可能会重名, 加入时间防止重名.
 *
 * @param {string} archiveFilePath
 *   原归档文件路径.
 *
 * @return {string}
 *   归档文件路径.
 */
function getUniqueArchiveFilePath(archiveFilePath) {
	if (!fs.existsSync(archiveFilePath)) {
		return archiveFilePath;
	}

	const parsedArchiveFile = path.parse(archiveFilePath);

	return `${parsedArchiveFile.dir}\\${parsedArchiveFile.name}-${moment().tz(MOMENT_TIMEZONE).format('YYYYMMDD-HHmmss')}${parsedArchiveFile.ext}`;
}

/**
 * 删除文件.
 *
 * @param {string} fileName
 *   文件名
 * @param {string} type
 *   文件所属类型.
 *
 * @return {boolean}
 *   是否删除成功.
 */
function deleteFile(fileName, type) {
	const realPath = getRealPath(type, fileName);

	if (!fs.existsSync(realPath)) {
		return false;
	}

	try {
		fs.unlinkSync(realPath);
		return true;
	} catch (e) {
		return false;
	}
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

	fs.copyFileSync(realPath, getUniqueArchiveFilePath(`${typeArchiveDirectory}\\${fileName}`));

	// 删除原文件.
	if (deleteOrg) {
		fs.unlinkSync(realPath);
	}
}

module.exports = {
	archiveFile,
	loadFiles,
	uploadFile,
	getRealPath,
	deleteFile,
	getArchivePath,
	getZipWriteStream,
};
