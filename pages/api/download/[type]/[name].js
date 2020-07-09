import { getRealPath, getArchivePath } from "../../../../library/file.controller";
import fs from 'fs';

export default (req, res) => {
	let filePath;

	switch (req.query.fileType) {
		case 'archive':
			filePath = getArchivePath(req.query.type, req.query.name);
			break;

		case 'edi':
		default:
			filePath = getRealPath(req.query.type, req.query.name);
	}

	if (!fs.existsSync(filePath)) {
		res.statusCode = 404
		res.end('404: Not found');
		return;
	}

	res.writeHead(200, {
		"Content-Type": "application/octet-stream",
		// 文件名需要URL encode处理否则会报错.
		"Content-Disposition": "attachment; filename=" + encodeURI(req.query.name),
	});

	fs.createReadStream(filePath).pipe(res);
};
