import { getRealPath } from "../../../../library/file.controller";
import fs from 'fs';

export default (req, res) => {
	const filePath = getRealPath(req.query.name, req.query.type);

	if (!fs.existsSync(filePath)) {
		res.statusCode = 404
		res.end('404: Not found');
		return;
	}

	res.writeHead(200, {
		"Content-Type": "application/octet-stream",
		"Content-Disposition": "attachment; filename=" + req.query.name
	});
	fs.createReadStream(filePath).pipe(res);
};
