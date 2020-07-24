import fs from "fs";
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
	 *
	 * @return {ReadStream}
	 */
	static async generate753(data) {
		const fromAddress = [data.from_city, data.from_state, data.from_country].filter(Boolean).join(',');
		const toAddress = [data.to_city, data.to_state, data.to_country].filter(Boolean).join(',');

		// 查找完全一样的发货地址, 如果不存在则新建.
		const existingFromData = {
			address_type: 'from',
			address_code: data.from_code,
			address_street: data.from_street,
			address_city: data.from_city,
			address_state: data.from_state,
			address_zip: data.from_zipcode,
			address_country: data.from_country,
		};
		const existingFromAddress = await db('ed_address').where(existingFromData)
			.select('address_id')
			.first();

		if (!existingFromAddress) {
			try {
				await db('ed_address').insert({
					address_title: `地址 - ${data.from_code}`,
					...existingFromData,
				});
			} catch (e) {
				console.log(e);
			}
		}

		// 查找完全一样的收货地址, 如果不存在则新建.
		const existingToData = {
			address_type: 'to',
			address_code: data.ship_to,
			address_street: data.to_street,
			address_city: data.to_city,
			address_state: data.to_state,
			address_zip: data.to_zipcode,
			address_country: data.to_country,
		};
		const existingToAddress = await db('ed_address').where(existingToData)
			.select('address_id')
			.first();

		if (!existingToAddress) {
			try {
				await db('ed_address').insert({
					address_title: `地址 - ${data.ship_to}`,
					...existingToData,
				});
			} catch (e) {
				console.log(e);
			}
		}

		return this.generate(`753-${moment().format('MMDD')}-PO-${data.po_number}`, [
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
			['TYPE', 'TOTAL NUMBER OF CARTONS', 'WIGHT UNIT',	'WEIGHT', 'VOLUME UNIT', 'VOLUME'],
			['CTN', data.total_carton, data.weight_unit, data.weight, data.volume_unit, data.volume],
		]);
	}

	/**
	 * 生成标签Excel文档.
	 *
	 * @param {Object} data
	 *   标签数据.
	 *
	 * @return {ReadStream}
	 */
	static generateLabelExcel(data) {
		const palletNumRow = ['PALLET NUMBER'];
		const packageInPalletRow = ['PACKAGES IN PALLET'];

		data.pallets.forEach(pallet => {
			palletNumRow.push(pallet.pallet_num, pallet.pallet_num_to);
			packageInPalletRow.push(pallet.package_in_pallet, '');
		});

		return this.generate(`754-label-${moment().format('MMDD')}-PO-${data.po_number}-${data.pallet_num}-${data.pallet_num_to}`, [
			['PO', data.po_number],
			['ARN', data.arn],
			['SHIP FROM', data.from_code, 'Jointown', data.from_street, data.from_city, data.from_state, data.from_zipcode, data.from_country],
			['SHIP TO', data.ship_to, data.receiver, data.to_street, data.to_city, data.to_state, data.to_zipcode, data.to_country],
			['CARRIER', data.carrier, data.carrier_code],
			['BOL', data.po_number],
			['PRO', data.pro],
			['ASIN', data.asin],
			['TOTAL PALLET', data.total_pallet],
			palletNumRow,
			packageInPalletRow,
			['TYPE', 'TOTAL NUMBER OF CARTONS', 'WEIGHT UNIT',	'WEIGHT(KG)', 'VOLUME UNIT', 'VOLUME(SF)', 'UPC', 'UNIT'],
			['CTN', data.total_carton, data.weight_unit, data.weight, data.volume_unit, data.volume],
		]);
	}

	/**
	 * 生成856 Excel文档.
	 *
	 * @param {Object} data
	 *   856数据.
	 *
	 * @return {ReadStream}
	 */
	static generate856(data) {
		return this.generate(`856-${moment().format('MMDD')}-PO-${data.po_number}`, [
			['SENDER', 'JOINTOWN'],
			['RECEIVER', 'AMAZON'],
			['SHIP DATE', data.ship_date],
			['DELIVERY DATE', data.ship_date],
			['ARN', data.arn],
			['SHIP FROM', data.from_code, data.shipper || 'Jointown', data.from_street, data.from_city, data.from_state, data.from_zipcode, data.from_country],
			['SHIP TO', data.ship_to, data.receiver || 'AMAZON', data.to_street, data.to_city, data.to_state, data.to_zipcode, data.to_country],
			['CARRIER', data.carrier, data.carrier_code],
			['BOL', data.po_number],
			['PRO', data.pro],
			['ASIN', data.asin],
			['TRACKING NO', data.pro],
			['SSCC', ''],
			['NUMBER OF STACKED PALLETS', data.stacked_pallets || 0, 'NUMBER OF UNSTACKED PALLETS', data.total_pallet],
			['PO#', data.po_number],
			['SHIPMENT REFERENCE', data.po_number],
			['TO BE SHIPPED (EA)', data.to_be_shipped],
			['TYPE', 'TOTAL NUMBER OF CARTONS', 'WEIGHT UNIT',	'WEIGHT(KG)', 'VOLUME UNIT', 'VOLUME(SF)', 'UPC', 'UNIT'],
			['CTN', data.total_carton, data.weight_unit, data.weight, data.volume_unit, data.volume, data.asin, data.type_unit],
		]);
	}

	/**
	 * 通用生成函数.
	 *
	 * @param {string} title
	 *   excel文件名.
	 * @param {Object} data
	 *   excel文档数据.
	 *
	 * @return {ReadStream}
	 */
	static generate(title, data) {
		const wb = xlsx.utils.book_new();
		wb.Props = {
			Title: title,
			Author: 'Easy EDI',
			CreatedDate: new Date(),
		};

		const worksheet = xlsx.utils.aoa_to_sheet(data);

		worksheet['!cols'] = [
			{wch:25},
			{wch:25},
			{wch:25},
			{wch:25},
			{wch:25},
			{wch:25}
		];

		wb.SheetNames.push('Sheet1');
		wb.Sheets['Sheet1'] = worksheet;

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
