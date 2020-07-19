import { getFileData, getFilePath } from '../../../../../library/file.controller';
import fs from 'fs';

export default (req, res) => {
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

	res.status(200)
		.json({
			status: 'ok',
			result: {
				file: getFileData(req.query.fileName, req.query.dirType, req.query.type,true),
			}
		});
};
