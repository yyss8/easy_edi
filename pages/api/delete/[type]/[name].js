import { deleteFile } from "../../../../library/file.controller";

export default (req, res) => {
	const successed = deleteFile(req.query.name, req.query.type);

	res.status(200).json({
		status: 'ok',
		result: {
			deleted: successed ? 1 : 0,
		}
	});
};
