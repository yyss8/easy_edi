import { deleteFile, loadFiles } from '../../../../library/file.controller';

export default (async (req, res) => {
	switch (req.method.toLowerCase()) {
		case 'delete':
			const files = await loadFiles(req.query.type, {
				shouldSort: false,
				shouldFilter: false,
				fileType: 'archive',
			})

			let deleted = 0;
			files.forEach(file => {
				console.log(req.body.fileNames.indexOf(file.name), file.name);
				if (req.body.fileNames.indexOf(file.name) === -1) {
					return;
				}

				deleteFile(file.name, req.query.type);
				deleted ++;
			});

			res.status(200).json({
				status: 'ok',
				result: {
					deleted,
				},
			});
			break;

		default:
			res.status(404).end('404 - Unfound');
	}
});
