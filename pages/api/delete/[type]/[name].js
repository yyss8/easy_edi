import { deleteFile } from "../../../../library/file.controller";

export default (req, res) => {
	switch (req.method.toLowerCase()) {
		case 'delete':
			const successed = deleteFile(req.query.name, req.query.type);

			res.status(200).json({
				status: 'ok',
				result: {
					deleted: successed ? 1 : 0,
				}
			});
			break;

		default:
			res.status(404).end('404 - Unfound');
	}
};
