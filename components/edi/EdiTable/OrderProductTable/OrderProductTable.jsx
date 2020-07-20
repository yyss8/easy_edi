import React from 'react';
import {Table} from "antd";

/**
 * 850订单商品表格.
 */
export default props => {

	const tableColumns850 = [
		{
			title: 'Quantity',
			dataIndex: 'quantity',
			key: 'quantity',
		},
		{
			title: 'Unit',
			dataIndex: 'unit',
			key: 'unit',
		},
		{
			title: 'Price',
			dataIndex: 'price',
			key: 'price',
		},
		{
			title: 'Qualifier',
			dataIndex: 'qualifier',
			key: 'qualifier',
		},
		{
			title: 'ID',
			dataIndex: 'id',
			key: 'id',
		},
	];

	return <Table size="small" title={props.withTitle === false ? null : () => '订单商品'} columns={tableColumns850} dataSource={props.products} pagination={false} />;
}
