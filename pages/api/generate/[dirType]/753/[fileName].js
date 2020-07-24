import { generateExcel, getFileData } from '../../../../../library/file.controller';

export default async (req, res) => {
	switch (req.method.toLowerCase()) {
		case 'post':
			const orgData = getFileData(req.query.fileName, req.query.dirType, '850', true);

			const generatedExcel = await generateExcel({
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
