import { generateExcel, getFileData } from '../../../../../library/file.controller';

/**
 * 生成856 Ext文档接口。
 */
export default async (req, res) => {
  switch (req.method.toLowerCase()) {
    case 'post':
      const orgData = getFileData(req.query.fileName, 'archive', 'label-excel', true);
      const isSubmit = Number(req.query.submit) === 1;

      try {
        const { titleOverride, ...restData } = req.body;
        const generatedExcel = await generateExcel(
          {
            ...orgData,
            ...restData,
          },
          '856-ext',
          isSubmit,
          titleOverride
        );

        if (isSubmit) {
          res.status(200).json({
            status: 'ok',
            result: {
              submitted: 1,
            },
          });
          return;
        }

        res.writeHead(200, {
          'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          // 文件名需要URL encode处理否则会报错.
          'Content-Disposition': 'attachment; filename=856.xlsx',
        });

        generatedExcel.pipe(res);
      } catch (e) {
        res.status(500).json({
          status: 'err',
          errorMessage: e,
        });
      }
      break;

    default:
      res.status(404).end('404 - Unfound');
  }
};
