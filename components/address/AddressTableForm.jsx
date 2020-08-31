import { Button, Form, Input, Table } from 'antd';
import { MinusCircleOutlined } from '@ant-design/icons';
import styles from './AddressTableForm.module.scss';

import { getFormTableColumnParams } from '../utilities/general';

/**
 * 地址列表表单组件.
 */
const AddressTableForm = (props) => {
  const addressColumns = [
    {
      ...getFormTableColumnParams('address', props.formRef.current, 'address_title'),
      title: 'Description',
      render: (text, record) => {
        return (
          <Form.Item rules={[{ required: true, message: '地址描述不能为空' }]} name={[record.name, 'address_title']}>
            <Input size='small' placeholder='描述' />
          </Form.Item>
        );
      },
    },
    {
      ...getFormTableColumnParams('address', props.formRef.current, 'address_code'),
      title: props.type === 'to' ? 'Warehouse Code' : 'Address Number',
      className: 'medium-input',
      render: (text, record) => {
        return (
          <Form.Item
            name={[record.name, 'address_code']}
            rules={[
              {
                validator: (_, value) => {
                  if (!Boolean(value)) {
                    return Promise.reject('地址Code不能为空.');
                  }

                  if (
                    props.formRef.current
                      .getFieldValue('address')
                      .find(
                        (address, i) =>
                          Boolean(address) && address.address_code === value && _.field !== `address.${i}.address_code`
                      )
                  ) {
                    return Promise.reject('地址Code已存在.');
                  }

                  return Promise.resolve();
                },
              },
            ]}>
            <Input size='small' placeholder='Code' />
          </Form.Item>
        );
      },
    },
    {
      ...getFormTableColumnParams('address', props.formRef.current, 'address_owner'),
      title: props.type === 'from' ? 'Sender' : 'Receiver',
      className: 'medium-input',
      render: (text, record, i) => {
        return (
          <Form.Item name={[record.name, 'address_owner']}>
            <Input size='small' placeholder={props.type === 'from' ? 'Sender' : 'Receiver'} />
          </Form.Item>
        );
      },
    },
    {
      ...getFormTableColumnParams('address', props.formRef.current, 'address_street'),
      title: 'Street',
      render: (text, record) => {
        return (
          <Form.Item name={[record.name, 'address_street']}>
            <Input size='small' placeholder='Street' />
          </Form.Item>
        );
      },
    },
    {
      ...getFormTableColumnParams('address', props.formRef.current, 'address_city'),
      title: 'City',
      className: 'medium-input',
      render: (text, record) => {
        return (
          <Form.Item name={[record.name, 'address_city']}>
            <Input size='small' placeholder='City' />
          </Form.Item>
        );
      },
    },
    {
      ...getFormTableColumnParams('address', props.formRef.current, 'address_state'),
      title: 'State',
      className: 'short-input',
      render: (text, record) => {
        return (
          <Form.Item name={[record.name, 'address_state']}>
            <Input size='small' placeholder='State' />
          </Form.Item>
        );
      },
    },
    {
      ...getFormTableColumnParams('address', props.formRef.current, 'address_zip'),
      title: 'Zip Code',
      className: 'short-input',
      render: (text, record) => {
        return (
          <Form.Item name={[record.name, 'address_zip']}>
            <Input size='small' placeholder='Zip Code' />
          </Form.Item>
        );
      },
    },
    {
      ...getFormTableColumnParams('address', props.formRef.current, 'address_country'),
      title: 'Country',
      className: 'short-input',
      render: (text, record) => {
        return (
          <Form.Item name={[record.name, 'address_country']}>
            <Input size='small' placeholder='Country' />
          </Form.Item>
        );
      },
    },
    {
      title: '',
      key: 'action',
      render: (text, record) => (
        <span>
          <Button
            size='small'
            icon={<MinusCircleOutlined />}
            type='danger'
            title='删除'
            onClick={() => props.actions.remove(record.name)}
          />
        </span>
      ),
    },
  ];

  if (props.type === 'from') {
    addressColumns.splice(1, 0, {
      ...getFormTableColumnParams('address', props.formRef.current, 'vendor_code'),
      title: 'Vendor Code',
      className: 'medium-input',
      render: (text, record) => (
        <Form.Item name={[record.name, 'vendor_code']}>
          <Input size='small' placeholder='Vendor Code' />
        </Form.Item>
      ),
    });
  }

  return (
    <Table
      loading={props.isLoading}
      className={styles['address-form']}
      dataSource={props.fields}
      columns={addressColumns}
      pagination={false}
    />
  );
};

export default AddressTableForm;
