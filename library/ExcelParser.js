const xlsx = require('xlsx');

/**
 * 文档Excel解析工具.
 *
 * 解析函数命名规则:
 * "parse{文档类型}", 比如parse753. 如果有"-"需转换为"_".
 */
class ExcelParser {
  /**
   * 解析753文档.
   *
   * @param {string} filePath
   *   文件路径.
   * @param {Object} [data]
   *   已有文档数据.
   *
   * @return {{}}
   */
  static parse753(filePath, data = null) {
    const fetchingDataMap = {
      po_number: 'B9',
      freight_ready_date: 'B3',
      type: 'A12',
      total_carton: 'B12',
      weight_unit: 'C12',
      weight: 'D12',
      volume_unit: 'E12',
      volume: 'F12',
    };

    return this.parse(
      filePath,
      fetchingDataMap,
      (key, position, sheet, lastRow) => {
        switch (key) {
          default:
            return typeof sheet[position] === 'undefined' ? '' : sheet[position].v;
        }
      },
      data
    );
  }

  /**
   * 解析标签文档.
   *
   * @param {string} filePath
   *   文件路径.
   * @param {Object} [data]
   *   已有文档数据.
   *
   * @return {{}}
   */
  static parselabel_excel(filePath, data = null) {
    const fetchingDataMap = {
      po_number: 'B1',
      arn: 'B2',
      from_code: 'B3',
      from_street: 'D3',
      from_city: 'E3',
      from_state: 'F3',
      from_zipcode: 'G3',
      from_country: 'H3',
      ship_to: 'B4',
      receiver: 'C4',
      to_street: 'D4',
      to_city: 'E4',
      to_state: 'F4',
      to_zipcode: 'G4',
      to_country: 'H4',
      carrier: 'B5',
      carrier_code: 'C5',
      pro: 'B7',
      asin: 'B8',
      total_pallet: 'B9',
      type: 'A13',
      total_carton: 'B13',
      weight_unit: 'C13',
      weight: 'D13',
      volume_unit: 'E13',
      volume: 'F13',
    };

    return this.parse(
      filePath,
      fetchingDataMap,
      (key, position, sheet, lastRow) => {
        switch (key) {
          default:
            return typeof sheet[position] === 'undefined' ? '' : sheet[position].v;
        }
      },
      data
    );
  }

  /**
   * 解析850文档.
   *
   * @param {string} filePath
   *   文件路径.
   * @param {Object} [data]
   *   已有文档数据.
   *
   * @return {{}}
   */
  static parse850(filePath, data = null) {
    const fetchingDataMap = {
      po_number: 'B1',
      date: 'E1',
      shipping_window: 2,
      ship_to: 'B3',
      products: 6,
    };

    return this.parse(
      filePath,
      fetchingDataMap,
      (key, position, sheet, lastRow) => {
        switch (key) {
          case 'shipping_window':
            return {
              start: typeof sheet[`B${position}`] === 'undefined' ? '' : sheet[`B${position}`].v,
              end: typeof sheet[`C${position}`] === 'undefined' ? '' : sheet[`C${position}`].v,
            };

          case 'products':
            const products = [];

            for (let i = position; i <= lastRow; i++) {
              const quantityPosition = `B${i}`;
              if (typeof sheet[quantityPosition] === 'undefined') {
                continue;
              }

              products.push({
                quantity: sheet[quantityPosition].v,
                unit: sheet[`C${i}`].v,
                price: sheet[`D${i}`].v,
                qualifier: sheet[`E${i}`].v,
                asin: sheet[`F${i}`].v,
              });
            }

            return products;

          default:
            return typeof sheet[position] === 'undefined' ? '' : sheet[position].v;
        }
      },
      data
    );
  }

  /**
   * 解析754文档.
   *
   * @param {string} filePath
   *   文件路径.
   * @param {Object} [data]
   *   已有文档数据.
   *
   * @return {{}}
   */
  static parse754(filePath, data = null) {
    const fetchingDataMap = {
      po_number: 'B1',
      arn: 'B2',
      from_code: 'B3',
      from_street: 'D3',
      from_city: 'E3',
      from_state: 'F3',
      from_zipcode: 'G3',
      from_country: 'H3',
      receiver: 'C4',
      to_street: 'D4',
      to_city: 'E4',
      to_state: 'F4',
      to_zipcode: 'G4',
      to_country: 'H4',
      carrier: 'B5',
      carrier_code: 'C5',
      pro: 'B7',
      asin: 'B8',
      total_pallet: 'B9',
      type: 'A13',
      total_carton: 'B13',
      weight_unit: 'C13',
      weight: 'D13',
      volume_unit: 'E13',
      volume: 'F13',
    };

    return this.parse(
      filePath,
      fetchingDataMap,
      (key, position, sheet, lastRow) => {
        switch (key) {
          default:
            return typeof sheet[position] === 'undefined' ? '' : sheet[position].v;
        }
      },
      data
    );
  }

  /**
   * 通用文档解析函数.
   *
   * @param {string} filePath
   *   文件路径.
   * @param {Object} dataMap
   *   文档数据位置map.
   * @param {function} assignCallback
   *   用于判断数据该如何赋值的回调.
   * @param {Object} [data]
   *   已有文档数据.
   *
   * @return {{}}
   */
  static parse(filePath, dataMap, assignCallback, data = null) {
    const parsed = xlsx.readFile(filePath);
    const fetchedData = {};

    const sheetNames = parsed.SheetNames;
    const sheet = parsed.Sheets[sheetNames[0]];

    const lastRow = Boolean(sheet['!ref']) ? this.getLastRow(sheet['!ref']) : null;
    Object.entries(dataMap).forEach(([key, position]) => {
      fetchedData[key] = assignCallback(key, position, sheet, lastRow);
    });

    if (data === null) {
      return fetchedData;
    }

    return {
      ...data,
      ...fetchedData,
    };
  }

  static getLastRow(ref) {
    return ref.split(':')[1]?.match(/(\d+)/)[0];
  }
}

module.exports = ExcelParser;
