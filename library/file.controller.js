const EDI_PATH = process.env.EDI_DIR;
const fs = require('fs');
const moment = require('moment');
require('moment-timezone');
const MOMENT_FORMAT = 'MMMM Do YYYY, h:mm:ss a';
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

function loadFiles(type, params = {}) {
	const typeDir = TYPE_MAPPING[type];
	const typeFullPath = `${EDI_PATH}${typeDir}`;
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
 * 排序文件
 *
 * @param {Array} files - 文件
 * @param {string} sorting - 排序方式.
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
 * @param tempPath
 * @param name
 * @param type
 * @return {Promise<unknown>}
 */
function uploadFile(tempPath, name, type) {
	const realPath = getRealPath(name, type);
	// 不允许跨硬盘移动, 先复制再删除.
	fs.copyFileSync(tempPath, realPath);
	fs.unlinkSync(tempPath);
}

function deleteFile(fileName, type) {
	const realPath = getRealPath(fileName, type);

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

function getRealPath(fileName, type) {
	const typeDir = TYPE_MAPPING[type];
	const typeFullPath = `${EDI_PATH}${typeDir}`;

	return `${typeFullPath}\\${fileName}`;
}

module.exports = {
	loadFiles,
	uploadFile,
	getRealPath,
	deleteFile,
};
