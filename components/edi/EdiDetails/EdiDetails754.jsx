import React from 'react';
import { Descriptions } from 'antd';

/**
 * 754详情组件.
 */
export default ({ file }) => {
  const shipFrom = [
    file.from_code,
    'Jointown',
    file.from_street,
    file.from_city,
    file.from_state,
    file.from_zipcode,
    file.from_country,
  ]
    .filter(Boolean)
    .join(', ');
  const shipTo = [
    file.ship_to,
    file.receiver,
    file.to_street,
    file.to_city,
    file.to_state,
    file.to_zipcode,
    file.to_country,
  ]
    .filter(Boolean)
    .join(', ');

  return (
    <Descriptions size='middle' layout='vertical' title='754信息' bordered>
      <Descriptions.Item span={2} label='PO #'>
        <b>{file.po_number}</b>
      </Descriptions.Item>
      <Descriptions.Item span={2} label='ARN'>
        <b>{file.arn}</b>
      </Descriptions.Item>
      <Descriptions.Item span={3} label='Ship From'>
        <b>{shipFrom}</b>
      </Descriptions.Item>
      <Descriptions.Item span={3} label='Ship To'>
        <b>{shipTo}</b>
      </Descriptions.Item>
    </Descriptions>
  );
};
