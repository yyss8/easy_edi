import React from 'react';
import { Descriptions } from 'antd';

/**
 * 标签文档描述组件.
 */
export default ({file}) => {
	const shipFrom = [file.from_code, 'Jointown', file.from_street, file.from_city, file.from_state, file.from_zipcode, file.from_country].filter(Boolean).join(', ');
	const shipTo = [file.ship_to, file.receiver, file.to_street, file.to_city, file.to_state, file.to_zipcode, file.to_country].filter(Boolean).join(', ');

	return <Descriptions size="middle" layout="vertical" title="标签文档信息" bordered>
		<Descriptions.Item span={1} label="PO #"><b>{file.po_number}</b></Descriptions.Item>
		<Descriptions.Item span={1} label="ARN"><b>{file.arn}</b></Descriptions.Item>
		<Descriptions.Item span={1} label="ASIN"><b>{file.asin}</b></Descriptions.Item>
		<Descriptions.Item span={3} label="Ship From"><b>{shipFrom}</b></Descriptions.Item>
		<Descriptions.Item span={3} label="Ship To"><b>{shipTo}</b></Descriptions.Item>
		<Descriptions.Item span={2} label="Total Pallet"><b>{file.total_pallet}</b></Descriptions.Item>
		<Descriptions.Item span={2} label="Total Carton"><b>{file.total_pallet}</b></Descriptions.Item>
		<Descriptions.Item span={2} label="Weight Unit"><b>{file.weight_unit}</b></Descriptions.Item>
		<Descriptions.Item span={2} label="Weight"><b>{file.weight}</b></Descriptions.Item>
		<Descriptions.Item span={2} label="Volume Unit"><b>{file.volume_unit}</b></Descriptions.Item>
		<Descriptions.Item span={2} label="volume"><b>{file.volume}</b></Descriptions.Item>
	</Descriptions>
};
