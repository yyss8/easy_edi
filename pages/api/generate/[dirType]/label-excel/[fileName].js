import { generateExcel, getFileData, getFilePath } from '../../../../../library/file.controller';
import fs from 'fs';

/**
 * 生成754 label接口。
 */
export default (req, res) => {
	switch (req.method.toLowerCase()) {
		case 'post':
			const path754 = getFilePath(req.query.dirType, '754', req.query.fileName);
			const data754 = getFileData(req.query.fileName, path754, '754', true);
			let data850 = {};
			const fileName850 = `${data754.po_number}.xlsx`;
			const path850 = getFilePath(req.query.dirType, '850', fileName850);

			if (fs.existsSync(path850)) {
				data850 = getFileData(fileName850, path850, '850', true);
			}

			const generatedExcel = generateExcel({
				...data850,
				...data754,
				...req.body,
			}, 'label-excel');

			res.writeHead(200, {
				'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
				// 文件名需要URL encode处理否则会报错.
				"Content-Disposition": "attachment; filename=label-excel.xlsx" ,
			});

			generatedExcel.pipe(res);
			break;

		default:
			res.status(404).end('404 - Unfound');
	}
};
