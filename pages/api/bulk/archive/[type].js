import { archiveFile, loadFiles } from '../../../../library/file.controller';

export default (async (req, res) => {
	switch (req.method.toLowerCase()) {
		case 'post':
			const files = await loadFiles(req.query.type, {
				shouldSort: false,
				shouldFilter: false,
			})

			let archived = 0;
			files.forEach(file => {
				if (req.body.fileNames.indexOf(file.name) === -1) {
					return;
				}

				archiveFile(file.name, req.query.type, true);
				archived ++;
			});

			res.status(200).json({
				status: 'ok',
				result: {
					archived,
				},
			});
			break;

		default:
			res.status(404).end('404 - Unfound');
	}
});
