import React from 'react';
import { Table } from 'antd';

/**
 * 855订单商品表格.
 */
const ConfirmedProductTable = (props) => {
	const tableColumns855 = [
		{
			title: 'ASIN',
			dataIndex: 'asin',
			key: 'asin',
		},
		{
			title: 'Quantity',
			dataIndex: 'quantity',
			key: 'quantity',
		},
		{
			title: 'Price',
			dataIndex: 'price',
			key: 'price',
		},
		{
			title: 'Unit',
			dataIndex: 'unit',
			key: 'unit',
		},
		{
			title: 'Action',
			dataIndex: 'action',
			key: 'action',
		},
	];

	return (
		<Table
			size='small'
			title={props.withTitle === false ? null : () => '商品'}
			columns={tableColumns855}
			dataSource={props.products}
			pagination={false}
		/>
	);
};

export default ConfirmedProductTable;
