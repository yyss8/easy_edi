import { generateExcel, getFileData } from '../../../../../library/file.controller';

/**
 * 生成856文档接口。
 */
export default async (req, res) => {
	switch (req.method.toLowerCase()) {
		case 'post':
			const data = getFileData(req.query.fileName, 'archive', 'label-excel', true);

			const generatedExcel = generateExcel({
				...data,
				...req.body,
			}, '856');

			res.writeHead(200, {
				'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
				// 文件名需要URL encode处理否则会报错.
				"Content-Disposition": "attachment; filename=856.xlsx" ,
			});

			generatedExcel.pipe(res);
			break;

		default:
			res.status(404).end('404 - Unfound');
	}
};
