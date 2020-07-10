const xlsxParser = require('xlsx');

class ExcelParser {
	static parse850(filePath, data = null) {
		const fetchingDataMap = {
			'po_number': 'B1',
			'date': 'E1',
			'shipping_window': 2,
			'ship_to': 'B3',
			'products': 6,
		};

		return this.parse(filePath, fetchingDataMap, (key, position, sheet, lastRow) => {
			switch (key) {
				case 'shipping_window':
					return {
						start: typeof sheet[`B${position}`] === 'undefined' ? '' : sheet[`B${position}`].v,
						end: typeof sheet[`C${position}`] === 'undefined' ? '' : sheet[`C${position}`].v,
					};

				case 'products':
					const products = [];

					for (let i = position; i <= lastRow; i ++ ) {
						const quantityPosition = `B${i}`;
						if (typeof sheet[quantityPosition] === 'undefined') {
							continue;
						}

						products.push({
							quantity: sheet[quantityPosition].v,
							unit: sheet[`C${i}`].v,
							price: sheet[`D${i}`].v,
							qualifier: sheet[`E${i}`].v,
							id: sheet[`F${i}`].v,
						});
					}

					return products;

				default:
					return typeof sheet[position] === 'undefined' ? '' : sheet[position].v;
			}
		}, data);
	}

	static parse754(filePath, data = null) {
		const fetchingDataMap = {
			'po_number': 'B1',
			'arn': 'B2',
			'ship_from': 'B3',
			'carrier': 'B5',
		};

		return this.parse(filePath, fetchingDataMap, (key, position, sheet, lastRow) => {
			switch (key) {
				default:
					return typeof sheet[position] === 'undefined' ? '' : sheet[position].v;
			}
		}, data);
	}

	static parse(filePath, dataMap, assignCallback, data = null) {
		const parsed = xlsxParser.readFile(filePath);
		const fetchedData = {};

		const sheet = parsed.Sheets['Sheet1'];
		const lastRow = this.getLastRow(sheet['!ref']);
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
		return ref.split(':')[1].match(/(\d+)/)[0];
	}
}

module.exports = ExcelParser;
