import fs from "fs";
import path from 'path';

const xlsx = require('xlsx');
const moment = require('moment');

/**
 * Excel文档生成工具.
 */
class ExcelGenerator {
	/**
	 * 生成753文档
	 *
	 * @param {Object} data
	 *   753文档数据.
	 *
	 * @return {ReadStream}
	 */
	static generate753(data) {
		const fromAddress = [data.from_city, data.from_state, data.from_country].filter(Boolean).join(',');
		const toAddress = [data.to_city, data.to_state, data.to_country].filter(Boolean).join(',');

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

	static generateLabelExcel(data) {
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
			['PALLET NUMBER', data.pallet_num, data.pallet_num_to],
			['PACKAGES IN PALLET', data.package_in_pallet]
		]);
	}

	static generate856(data) {

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

		wb.SheetNames.push('Data');
		wb.Sheets['Data'] = worksheet;

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
