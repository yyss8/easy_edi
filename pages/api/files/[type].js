import { loadFiles } from '../../../library/file.controller';

export default (req, res) => {
	const { type, ...params } = req.query;
	const files = loadFiles(type, params);

	res.json({
		files,
	});
};
