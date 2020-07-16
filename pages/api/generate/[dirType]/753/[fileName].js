import { generateExcel, getFileData, getFilePath } from '../../../../../library/file.controller';

export default (req, res) => {
	switch (req.method.toLowerCase()) {
		case 'post':
			const orgPath = getFilePath(req.query.dirType, '850', req.query.fileName);
			const orgData = getFileData(req.query.fileName, orgPath, '850', true);

			const generatedExcel = generateExcel({
				...orgData,
				...req.body,
			}, '753');

			res.writeHead(200, {
				'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
				// 文件名需要URL encode处理否则会报错.
				"Content-Disposition": "attachment; filename=753-excel.xlsx" ,
			});

			generatedExcel.pipe(res);
			break;

		default:
			res.status(404).end('404 - Unfound');
	}
};
