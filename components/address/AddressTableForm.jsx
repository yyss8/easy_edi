import { Button, Form, Input, Table } from 'antd';
import { MinusCircleOutlined } from '@ant-design/icons';
import styles from './AddressTableForm.module.scss';

/**
 * 地址列表表单组件.
 */
export default (props) => {
  const addressColumns = [
    {
      title: 'Description',
      key: 'address_title',
      render: (text, record) => {
        return (
          <Form.Item rules={[{ required: true }]} name={[record.name, 'address_title']}>
            <Input size='small' placeholder='描述' />
          </Form.Item>
        );
      },
    },
    {
      title: 'Code',
      key: 'address_code',
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
            ]}
          >
            <Input size='small' placeholder='Code' />
          </Form.Item>
        );
      },
    },
    {
      title: props.type === 'from' ? 'Sender' : 'Receiver',
      key: 'owner',
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
      render: (text, record) => {
        return (
          <Form.Item name={[record.name, 'address_state']}>
            <Input size='small' placeholder='State/Province' />
          </Form.Item>
        );
      },
    },
    {
      title: 'Zip Code',
      key: 'address_zip',
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
