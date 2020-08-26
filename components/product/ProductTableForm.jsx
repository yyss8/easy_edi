import { Button, Form, Input, Table } from 'antd';
import { MinusCircleOutlined } from '@ant-design/icons';
import styles from './ProductTableForm.module.scss';

/**
 * 商品列表table表单组件.
 */
const ProductTableForm = (props) => {
  const productColumns = [
    {
      title: 'Description',
      key: 'product_title',
      render: (text, record) => {
        return (
          <Form.Item rules={[{ required: true }]} name={[record.name, 'product_title']}>
            <Input.TextArea rows={2} size='small' placeholder='Description' />
          </Form.Item>
        );
      },
    },
    {
      title: 'ASIN',
      key: 'asin',
      render: (text, record) => {
        return (
          <Form.Item
            name={[record.name, 'asin']}
            rules={[
              {
                validator: (_, value) => {
                  if (!Boolean(value)) {
                    return Promise.reject('商品Asin不能为空.');
                  }

                  if (
                    props.formRef.current
                      .getFieldValue('products')
                      .find(
                        (product, i) => Boolean(product) && product.asin === value && _.field !== `products.${i}.asin`
                      )
                  ) {
                    return Promise.reject('商品Asin已存在.');
                  }

                  return Promise.resolve();
                },
              },
            ]}>
            <Input size='small' placeholder='ASIN' />
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
      className={styles['product-form']}
      dataSource={props.fields}
      columns={productColumns}
      pagination={false}
    />
  );
};

export default ProductTableForm;
