import { getFileData, getFilePath } from '../../../../../library/file.controller';
import db from '../../../../../library/database.connection';
import fs from 'fs';

export default async (req, res) => {
	const filePath = getFilePath(req.query.dirType, req.query.type, req.query.fileName);



	if (!fs.existsSync(filePath)) {
		res
			.status(404)
			.json({
			status: 'err',
			errorMessage: '文件不存在',
		});
		return;
	}

	let data = getFileData(req.query.fileName, req.query.dirType, req.query.type,true);

	switch (req.query.type) {
		case '850':
			// 如果发送code存在则尝试获取已有地址.
			if (Boolean(data.ship_to)) {
				const toAddress = await db('ed_address').where({
					address_type: 'to',
					address_code: data.ship_to,
				})
					.first();

				if (Boolean(toAddress)) {
					data = {
						...data,
						...toAddress,
					};
				}
			}
			break;
	}

	res.status(200)
		.json({
			status: 'ok',
			result: {
				file: data,
			}
		});
};
