import React from 'react';
import { Select } from 'antd';

/**
 * 重量通用选择组件.
 */
export default props => {
	let options;

	switch (props.type) {
		case '856':
			options = [
				{ value: 'G', label: 'Gram' },
				{ value: 'K', label: 'Kilogram' },
				{ value: 'L', label: 'Pound' },
				{ value: 'O', label: 'Ounce' },
			];
			break;

		case '753':
		default:
			options = [
				{ value: 'GR', label: 'Gram' },
				{ value: 'KG', label: 'Kilogram' },
				{ value: 'LB', label: 'Pound' },
				{ value: 'OZ', label: 'Ounce' },
			];
	}

	return <Select size="small" {...props}>
		{ options.map(option => <Select.Option key={ option.value } value={ option.value }>{option.label}</Select.Option>) }
	</Select>
}
