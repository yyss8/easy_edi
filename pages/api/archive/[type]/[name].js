import { archiveFile } from "../../../../library/file.controller";

export default (req, res) => {
	switch (req.method.toLowerCase()) {
		case 'get':

			break;

		case 'post':
			archiveFile(req.query.name, req.query.type, true);

			res.status(200).json({
				status: 'ok',
				result: {
					archived: 1,
				}
			});
			break;

		default:
			res.status(404).end('');
	}
};
