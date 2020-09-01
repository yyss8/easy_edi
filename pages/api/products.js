import db from '../../library/database.connection';
import logger from '../../library/logger';
import { batchInsertDuplicate } from '../../library/mysql.controller';

/**
 * 商品列表api
 */
export default async (req, res) => {
  switch (req.method.toLowerCase()) {
    case 'get':
      const query = db('ed_product');

      if (typeof req.query.keyword !== 'undefined') {
        const keyword = `%${req.query.keyword}%`;
        query.whereRaw('product_title LIKE ?', keyword);
      }

      if (Boolean(req.query.asin)) {
        const asin = `%${req.query.asin}%`;
        query.whereRaw('asin LIKE ?', asin);
      }

      query
        .then((products) => {
          res.status(200).json({
            status: 'ok',
            result: {
              products,
            },
          });
        })
        .catch((err) => {
          logger.error(`获取商品出错: ${err.stack}`);

          res.status(500).json({
            errorMessage: err.toString(),
            status: 'err',
          });
        });
      break;

    case 'post':
      const products = req.body.products || [];
      let prevProducts = [];
      try {
        prevProducts = (await db('ed_product').pluck('product_id')) || [];
      } catch (e) {
        logger.error(`获取prevproducts出错: ${e.stack}`);
        res.status(500)
          .json({
            status: 'err',
            errorMessage: '系统出错, 请稍候再试.',
          });
        return;
      }

      const creatingProducts = products.filter((product) => !product.product_id);
      const updatingProducts = products.filter(
        (product) => Boolean(product.product_id) && prevProducts.indexOf(product.product_id) > -1
      );
      const deletingProducts = prevProducts.filter(
        (productId) => !products.find((product) => product.product_id === productId)
      );

      if (creatingProducts.length > 0) {
        try {
          await db.batchInsert('ed_product', creatingProducts);
        } catch (e) {
          logger.error(`创建商品出错: ${e.stack}`);
        }
      }

      if (deletingProducts.length > 0) {
        try {
          await db('ed_product').whereIn('product_id', deletingProducts).del();
        } catch (e) {
          logger.error(`删除商品出错: ${e.stack}`);
        }
      }

      if (updatingProducts.length > 0) {
        try {
          await batchInsertDuplicate(db, 'ed_product', updatingProducts);
        } catch (e) {
          logger.error(`更新商品出错: ${e.stack}`);
        }
      }

      res.status(200).json({
        status: 'ok',
        result: {
          updated: 1,
        },
      });
      break;
  }
};
