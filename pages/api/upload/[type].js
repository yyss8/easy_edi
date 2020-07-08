import formidable from 'formidable';
import { uploadFile } from '../../../library/file.controller';

export default (req, res) => {
	if (req.method.toLowerCase() === 'post') {
		const form = formidable({ multiples: true });
		form.parse(req, (err, fields, files) => {
			uploadFile(files.file.path, files.file.name, req.query.type);
			const response = {
				status: 'done',
				name: files.file.name,
				url: `/api/download/${req.query.type}/${files.file.name}`,
			};

			res.writeHead(200, { 'content-type': 'application/json' });
			res.end(JSON.stringify(response, null, 2));
		});
		return;
	}

	// show a file upload form
	res.status(400).end('Access denied');
};

export const config = {
	api: {
		bodyParser: false,
	},
};
