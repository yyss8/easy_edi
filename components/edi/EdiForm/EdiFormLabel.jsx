import React from 'react';
import FormBase from './EdiFormBase';
import { Form, Input, InputNumber } from 'antd';

export default class extends FormBase {
	getFormItems() {
		return <React.Fragment>
			<Form.Item name="pro" label="PRO" rules={[{ required: true }]}>
				<Input placeholder="输入PRO" />
			</Form.Item>
			<Form.Item name="asin" label="ASIN" rules={[{ required: true }]}>
				<Input placeholder="输入ASIN" />
			</Form.Item>
			<Form.Item name="total_pallet" label="Total Pallet" rules={[{ required: true }]}>
				<InputNumber placeholder="输入Total Pallet" />
			</Form.Item>
			<Form.Item name="package_in_pallet" label="Packages in Pallet" rules={[{ required: true }]}>
				<InputNumber placeholder="输入Packages in pallet" />
			</Form.Item>
		</React.Fragment>
	}
}
