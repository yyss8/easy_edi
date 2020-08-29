import { Button, Form, Input, Table } from 'antd';
import { MinusCircleOutlined } from '@ant-design/icons';
import styles from './AddressTableForm.module.scss';

/**
 * 地址列表表单组件.
 */
const AddressTableForm = (props) => {
  const addressColumns = [
    {
      title: 'Description',
      key: 'address_title',
      render: (text, record) => {
        return (
          <Form.Item rules={[{ required: true, message: '地址描述不能为空' }]} name={[record.name, 'address_title']}>
            <Input size='small' placeholder='描述' />
          </Form.Item>
        );
      },
    },
    {
      title: 'Vendor Code',
      key: 'vendor_code',
      className: 'medium-input',
      render: (text, record) => (
        <Form.Item name={[record.name, 'vendor_code']}>
          <Input size='small' placeholder='Vendor Code' />
        </Form.Item>
      ),
    },
    {
      title: 'Address Number',
      key: 'address_code',
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
      title: props.type === 'from' ? 'Sender' : 'Receiver',
      key: 'owner',
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
      title: 'Street',
      key: 'address_street',
      render: (text, record) => {
        return (
          <Form.Item name={[record.name, 'address_street']}>
            <Input size='small' placeholder='Street' />
          </Form.Item>
        );
      },
    },
    {
      title: 'City',
      key: 'address_city',
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
      title: 'State',
      key: 'address_state',
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
      title: 'Zip Code',
      key: 'address_zip',
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
      title: 'Country',
      key: 'address_country',
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
