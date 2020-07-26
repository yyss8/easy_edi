import { loadFiles } from '../../../../library/file.controller';

export default async (req, res) => {
	const { type, ...params } = req.query;
	params.fileType = 'archive';
	params.getDetail = true;
	const files = await loadFiles(type, params);

	res.json({
		status: 'ok',
		result: {
			files,
		},
	});
};
