import React from 'react';
import { Select } from 'antd';

/**
 * 货品类型(Cartons/Package)选择组件.
 */
const TypeSelect = (props) => {
  return (
    <Select {...props} size='small'>
      <Select.Option value='CTN'>Carton</Select.Option>
      <Select.Option value='PKG'>Package</Select.Option>
    </Select>
  );
};

export default TypeSelect;
