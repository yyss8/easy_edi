import fs from 'fs';
import path from 'path';
import db from './database.connection';

const xlsx = require('xlsx');
const moment = require('moment');

/**
 * Excel文档生成工具.
 */
class ExcelGenerator {
  /**
   * 生成753 Excel文档
   *
   * @param {Object} data
   *   753文档数据.
   * @param {boolean} submit
   *   是否直接提交至目录.
   * @param {boolean|string} titleOverride
   *   覆盖标题.
   *
   * @return {ReadStream|null}
   */
  static async generate753(data, submit = false, titleOverride = false) {
    const fromAddress = [data.from_city, data.from_state, data.from_country].filter(Boolean).join(',');
    const toAddress = [data.to_city, data.to_state, data.to_country].filter(Boolean).join(',');

    // 查找完全一样的发货地址, 如果不存在则新建.
    const existingFromAddress = await db('ed_address')
      .where('address_code', data.from_code)
      .select('address_id')
      .first();

    if (!existingFromAddress) {
      try {
        await db('ed_address').insert({
          address_title: `地址 - ${data.from_code}`,
          address_type: 'from',
          address_code: data.from_code,
          address_street: data.from_street,
          address_city: data.from_city,
          address_state: data.from_state,
          address_zip: data.from_zipcode,
          address_country: data.from_country,
        });
      } catch (e) {
        console.log(e);
      }
    }

    // 查找完全一样的收货地址, 如果不存在则新建.
    const existingToAddress = await db('ed_address').where('address_code', data.ship_to).select('address_id').first();

    if (!existingToAddress) {
      try {
        await db('ed_address').insert({
          address_title: `地址 - ${data.ship_to}`,
          address_type: 'to',
          address_code: data.ship_to,
          address_street: data.to_street,
          address_city: data.to_city,
          address_state: data.to_state,
          address_zip: data.to_zipcode,
          address_country: data.to_country,
        });
      } catch (e) {
        console.log(e);
      }
    }

    return this.generate(
      `753-${moment().format('MMDD')}-PO-${data.po_number}`,
      [
        ['FROM', 'JOINTOWN'],
        ['TO', 'AMAZON'],
        ['FREIGHT READY DATE', data.freight_ready_date],
        ['SHIP FROM', data.from_code, data.from_street, fromAddress, data.from_zipcode],
        ['SHIP TO', data.ship_to, data.to_street, toAddress, data.to_zipcode],
        ['FREIGHT CLASS', '50'],
        ['Number of PACKAGES(PALLETS)', data.total_pallet, 'PACKAGING FORM CODE', 'PLT'],
        ['STACKABLE', 'N'],
        ['PO#', data.po_number],
        ['SHIPMENT REFERENCE', data.po_number],
        ['TYPE', 'TOTAL NUMBER OF CARTONS', 'WIGHT UNIT', 'WEIGHT', 'VOLUME UNIT', 'VOLUME'],
        [data.type || 'CTN', data.total_carton, data.weight_unit, data.weight, data.volume_unit, data.volume],
      ],
      '753',
      submit,
      titleOverride
    );
  }

  /**
   * 生成标签Excel文档.
   *
   * @param {Object} data
   *   标签数据.
   * @param {boolean} submit
   *   是否直接提交至目录.
   * @param {string|false} titleOverride
   *   覆盖标题.
   *
   * @return {ReadStream|null}
   */
  static generateLabelExcel(data, submit = false, titleOverride = false) {
    const palletNumRow = ['PALLET NUMBER'];
    const packageInPalletRow = ['PACKAGES IN PALLET'];

    data.pallets.forEach((pallet) => {
      palletNumRow.push(pallet.pallet_num, pallet.pallet_num_to);
      packageInPalletRow.push(pallet.package_in_pallet, '');
    });

    return this.generate(
      `754-label-${moment().format('MMDD')}-PO-${data.po_number}-${data.pallet_num}-${data.pallet_num_to}`,
      [
        ['PO', data.po_number],
        ['ARN', data.arn],
        [
          'SHIP FROM',
          data.from_code,
          'Jointown',
          data.from_street,
          data.from_city,
          data.from_state,
          data.from_zipcode,
          data.from_country,
        ],
        [
          'SHIP TO',
          data.ship_to,
          data.receiver,
          data.to_street,
          data.to_city,
          data.to_state,
          data.to_zipcode,
          data.to_country,
        ],
        ['CARRIER', data.carrier, data.carrier_code],
        ['BOL', data.po_number],
        ['PRO', data.pro],
        ['ASIN', data.asin],
        ['TOTAL PALLET', data.total_pallet],
        palletNumRow,
        packageInPalletRow,
        ['TYPE', 'TOTAL NUMBER OF CARTONS', 'WEIGHT UNIT', 'WEIGHT', 'VOLUME UNIT', 'VOLUME', 'UPC', 'UNIT'],
        [data.type || 'CTN', data.total_carton, data.weight_unit, data.weight, data.volume_unit, data.volume],
      ],
      'label-excel',
      submit,
      titleOverride
    );
  }

  /**
   * 生成810 Excel文档.
   *
   * @param {Object} data
   *   856数据.
   * @param {boolean} submit
   *   是否直接提交至目录.
   * @param {string|boolean} titleOverride
   *   覆盖标题.
   *
   * @return {ReadStream|null}
   */
  static generate810(data, submit = false, titleOverride = false) {
    const preparedData = [
      ['SENDER', 'JOINTOWN'],
      ['RECEIVER', 'AMAZON'],
      [
        'SHIP FROM',
        data.from_code,
        data.shipper || 'Jointown',
        data.from_street,
        data.from_city,
        data.from_state,
        data.from_zipcode,
        data.from_country,
      ],
      [
        'SHIP TO',
        data.ship_to,
        data.receiver || 'AMAZON',
        data.to_street,
        data.to_city,
        data.to_state,
        data.to_zipcode,
        data.to_country,
      ],
      ['PO#', data.po_number],
      ['INV#', data.po_number],
      ['LINE#', 'ASIN', 'PRICE', 'QUANTITY', 'UNIT'],
    ];

    data.products.forEach((product, i) => {
      preparedData.push([
        i + 1,
        product.asin,
        product.price,
        product.quantity,
        product.unit,
      ]);
    });

    return this.generate(
      `810-${moment().format('MMDD')}-PO-${data.po_number}`,
      preparedData,
      '810',
      submit,
      titleOverride
    );
  }

  /**
   * 生成855 Excel文档.
   *
   * @param {Object} data
   *   856数据.
   * @param {boolean} submit
   *   是否直接提交至目录.
   * @param {string|boolean} titleOverride
   *   覆盖标题.
   *
   * @return {ReadStream|null}
   */
  static generate855(data, submit = false, titleOverride = false) {
    const preparedData = [
      ['SENDER', 'JOINTOWN'],
      ['RECEIVER', 'AMAZON'],
      ['PO#', data.po_number, '', 'Shipping Window', data.shipping_window.start, data.shipping_window.end, 'Ship To', data.ship_to],
      ['QUANTITY', data.quantity],
      ['LINE#', 'ASIN', 'QUANTITY', 'UNIT PRICE', 'ACTION', '', '', 'UNIT'],
    ];

    data.products.forEach((product, i) => {
      preparedData.push([
        i + 1,
        product.asin,
        product.quantity,
        product.price,
        product.action,
        '', // 字段预留
        '', // 字段预留
        product.unit,
      ]);
    });

    return this.generate(
      `855-${moment().format('MMDD')}-PO-${data.po_number}`,
      preparedData,
      '855',
      submit,
      titleOverride
    );
  }

  /**
   * 生成856 Excel文档.
   *
   * @param {Object} data
   *   856数据.
   * @param {boolean} submit
   *   是否直接提交至目录.
   * @param {string|boolean} titleOverride
   *   覆盖标题.
   *
   * @return {ReadStream|null}
   */
  static generate856(data, submit = false, titleOverride = false) {
    const preparedData = [
      ['SENDER', 'JOINTOWN'],
      ['RECEIVER', 'AMAZON'],
      ['SHIP DATE', data.ship_date],
      ['DELIVERY DATE', data.ship_date],
      ['ARN', data.arn],
      [
        'SHIP FROM',
        data.from_code,
        data.shipper || 'Jointown',
        data.from_street,
        data.from_city,
        data.from_state,
        data.from_zipcode,
        data.from_country,
      ],
      [
        'SHIP TO',
        data.ship_to,
        data.receiver || 'AMAZON',
        data.to_street,
        data.to_city,
        data.to_state,
        data.to_zipcode,
        data.to_country,
      ],
      ['CARRIER', data.carrier, data.carrier_code],
      ['BOL', data.po_number],
      ['PRO', data.pro],
      ['ASIN', data.asin],
      ['TRACKING NO', data.pro],
      ['SSCC', ''],
      ['NUMBER OF STACKED PALLETS', data.stacked_pallets || 0, 'NUMBER OF UNSTACKED PALLETS', data.unstacked_pallets],
      ['PO#', data.po_number],
      ['SHIPMENT REFERENCE', data.po_number],
      ['TO BE SHIPPED (EA)', data.to_be_shipped],
      ['TYPE', 'TOTAL NUMBER OF CARTONS', 'WEIGHT UNIT', 'WEIGHT', 'VOLUME UNIT', 'VOLUME', 'UPC', 'UNIT', 'Expiration'],
      [
        data.type || 'CTN',
        data.total_carton,
        data.weight_unit,
        data.weight,
        data.volume_unit,
        data.volume,
        data.asin,
        data.type_unit,
        data.expiration,
      ],
    ];

    return this.generate(
      `856-${moment().format('MMDD')}-PO-${data.po_number}`,
      preparedData,
      '856',
      submit,
      titleOverride
    );
  }

  /**
   * 生成856 格式2 Excel文档.
   *
   * @param {Object} data
   *   856数据.
   * @param {boolean} submit
   *   是否直接提交至目录.
   * @param {string|boolean} titleOverride
   *   覆盖标题.
   *
   * @return {ReadStream|null}
   */
  static generate856Ext(data, submit = false, titleOverride = false) {
    const preparedData = [
      ['SENDER', 'JOINTOWN'],
      ['RECEIVER', 'AMAZON'],
      ['SHIP DATE', data.ship_date],
      ['DELIVERY DATE', data.ship_date],
      ['ARN', data.arn],
      [
        'SHIP FROM',
        data.from_code,
        data.shipper || 'Jointown',
        data.from_street,
        data.from_city,
        data.from_state,
        data.from_zipcode,
        data.from_country,
      ],
      [
        'SHIP TO',
        data.ship_to,
        data.receiver || 'AMAZON',
        data.to_street,
        data.to_city,
        data.to_state,
        data.to_zipcode,
        data.to_country,
      ],
      ['CARRIER', data.carrier, data.carrier_code],
      ['BOL', data.po_number],
      ['PRO', data.pro],
      ['ASIN', data.asin],
      ['TRACKING NO', data.pro],
      ['VOLUME UNIT', data.volume_unit, 'VOLUME', data.volume],
      ['WEIGHT UNIT', data.weight_unit, 'TOTAL PACKAGES', data.total_carton],
      ['NUMBER OF STACKED PALLETS', data.stacked_pallets || 0, 'NUMBER OF UNSTACKED PALLETS', data.unstacked_pallets],
      ['PO #', data.po_number],
      ['SHIPMENT REFERENCE', data.po_number],
      ['TO BE SHIPPED', data.to_be_shipped],
      ['SSCC', 'QUANTITY', 'WEIGHT', 'UPC', 'UNIT']
    ];

    data.products.forEach(product => {
      preparedData.push([
        product.sscc,
        product.quantity,
        product.weight,
        product.upc,
        product.unit,
      ]);
    });

    return this.generate(
      `856-${moment().format('MMDD')}-PO-${data.po_number}`,
      preparedData,
      '856-ext',
      submit,
      titleOverride
    );
  }

  /**
   * 通用生成函数.
   *
   * @param {string} title
   *   excel文件名.
   * @param {Object} data
   *   excel文档数据.
   * @param {string} type
   *   Excel文档类型.
   * @param {boolean} submit
   *   是否直接提交至目录.
   * @param {string|boolean} titleOverride
   *   覆盖标题.
   *
   * @return {ReadStream|null}
   *   ReadStream或null如果为直接提交.
   */
  static generate(title, data, type, submit = false, titleOverride = false) {
    const wb = xlsx.utils.book_new();
    wb.Props = {
      Title: title,
      Author: 'Easy EDI',
      CreatedDate: new Date(),
    };

    const worksheet = xlsx.utils.aoa_to_sheet(data);

    worksheet['!cols'] = [{ wch: 25 }, { wch: 25 }, { wch: 25 }, { wch: 25 }, { wch: 25 }, { wch: 25 }];

    wb.SheetNames.push('Sheet1');
    wb.Sheets['Sheet1'] = worksheet;

    if (submit) {
      // 直接提交至excel目录.
      const fileName = `${titleOverride || title}.xlsx`;

      const { getFilePath } = require('./file.controller');
      const destPath = getFilePath('edi', type, fileName);
      const archivedPath = getFilePath('archive', type, fileName);
      xlsx.writeFile(wb, destPath, {
        bookType: 'xlsx',
        type: 'binary',
      });

      // 保存一份至归档.
      fs.copyFileSync(destPath, archivedPath);

      return null;
    }

    // 先生成临时文件, 然后通过路径获取ReadStream方便直接返回下载response.
    const tmpFilePath = path.resolve(`./tmp/${moment().format('YYYYMMDD-HHmmss')}-${Math.random()}.xlsx`);
    xlsx.writeFile(wb, tmpFilePath, {
      bookType: 'xlsx',
      type: 'binary',
    });

    const stream = fs.createReadStream(tmpFilePath);

    stream.on('end', () => {
      fs.unlinkSync(tmpFilePath);
    });

    return stream;
  }
}

module.exports = ExcelGenerator;
