import db from '../../../library/database.connection';
import logger from '../../../library/logger';

export default (req, res) => {
  const { asin } = req.query;

  db('ed_product')
    .where('asin', asin)
    .select('ctn_packing')
    .first()
    .then((product) => {
      res.status(200);

      if (!product) {
        res.json({
          status: 'ok',
          result: {
            not_found: 1,
          },
        });
      }

      const { shipped, total } = req.body;

      res.json({
        status: 'ok',
        result: {
          match: shipped * Number(product.ctn_packing) === total ? 1 : 0,
        },
      });
    })
    .catch((rejected) => {
      logger.error(`获取商品CTN Packing出错: ${rejected.stack}`);

      res.status(500).json({
        status: 'err',
        errorMessage: '系统错误, 请稍候再试...',
      });
    });
};
