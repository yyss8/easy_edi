import React from 'react';
import { Select } from 'antd';

/**
 * 体积通用选择组件.
 */
const VolumeSelect = (props) => {
  let options;

  switch (props.type) {
    case '856':
      options = [
        { value: 'CF', label: 'Cubic Feet' },
        { value: 'CI', label: 'Cubic Inches' },
        { value: 'CR', label: 'Cubic Meter' },
      ];
      break;

    case '753':
    default:
      options = [
        { value: 'E', label: 'Cubic Feet' },
        { value: 'N', label: 'Cubic Inches' },
        { value: 'X', label: 'Cubic Meter' },
      ];
  }

  return (
    <Select {...props} size='small'>
      {options.map((option) => (
        <Select.Option key={option.value} value={option.value}>
          {option.label}
        </Select.Option>
      ))}
    </Select>
  );
};

export default VolumeSelect;
