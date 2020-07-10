import { loadFiles } from '../../../../library/file.controller';

export default (req, res) => {
	const { type, ...params } = req.query;
	params.getDetail = true;
	const files = loadFiles(type, params);

	res.json({
		status: 'ok',
		result: {
			files,
		},
	});
};
