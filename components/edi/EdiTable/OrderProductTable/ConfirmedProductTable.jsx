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
		{
			title: 'Date 1',
			dataIndex: 'date_1',
			key: 'date_1',
		},
		{
			title: 'Date 2',
			dataIndex: 'date_2',
			key: 'date_2',
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
