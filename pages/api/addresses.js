import db from '../../library/database.connection';
import { batchInsertDuplicate } from '../../library/mysql.controller';

/**
 * 地址列表api
 */
export default async (req, res) => {
  switch (req.method.toLowerCase()) {
    case 'get':
      const query = db('ed_address');

      if (typeof req.query.keyword !== 'undefined') {
        const keyword = `%${req.query.keyword}%`;
        query.whereRaw('address_title LIKE ?', keyword);
      }

      if (Boolean(req.query.type)) {
        query.where('address_type', req.query.type);
      }

      query
        .then((addresses) => {
          res.status(200).json({
            status: 'ok',
            result: {
              addresses,
            },
          });
        })
        .catch((err) => {
          res.status(500).json({
            errorMessage: err.toString(),
            status: 'err',
          });
        });
      break;

    case 'post':
      const addresses = req.body.addresses || [];
      const type = req.body.type || 'from';
      const prevAddresses = (await db('ed_address').where('address_type', type).pluck('address_id')) || [];

      const creatingAddresses = addresses.filter((address) => !address.address_id);
      const updatingAddresses = addresses.filter(
        (address) => Boolean(address.address_id) && prevAddresses.indexOf(address.address_id) > -1
      );
      const deletingAddresses = prevAddresses.filter(
        (addressId) => !addresses.find((address) => address.address_id === addressId)
      );

      if (creatingAddresses.length > 0) {
        await db.batchInsert('ed_address', creatingAddresses);
      }

      if (deletingAddresses.length > 0) {
        await db('ed_address').whereIn('address_id', deletingAddresses).where('address_type', type).del();
      }

      if (updatingAddresses.length > 0) {
        await batchInsertDuplicate(db, 'ed_address', updatingAddresses);
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
