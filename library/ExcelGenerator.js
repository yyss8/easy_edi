import fs from "fs";
import path from 'path';

const xlsx = require('xlsx');
const moment = require('moment');

class ExcelGenerator {
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
