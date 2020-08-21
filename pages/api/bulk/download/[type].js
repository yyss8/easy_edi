import { getZipWriteStream } from '../../../../library/file.controller';

export default async (req, res) => {
  switch (req.method.toLowerCase()) {
    case 'post':
      const archive = await getZipWriteStream(req.query.type, req.body.fileType, req.body.fileNames);
      res.setHeader('Content-Type', 'application/zip');
      res.setHeader('Content-Disposition', 'attachment; filename=zipped.zip');

      archive.pipe(res);
      archive.finalize();
      break;

    default:
      res.status(404).end('404 - Unfound');
  }
};
