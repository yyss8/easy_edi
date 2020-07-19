import { generateExcel, getFileData } from '../../../../../library/file.controller';

/**
 * 生成754 label接口。
 */
export default (req, res) => {
	switch (req.method.toLowerCase()) {
		case 'post':
			const data = getFileData(req.query.fileName, req.query.dirType, '754', true);

			const generatedExcel = generateExcel({
				...data,
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
