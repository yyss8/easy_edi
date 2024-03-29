import React from 'react';
import FormBase from './EdiFormBase';
import { Form, Input, InputNumber, Row, Col, message, Button, Modal, Table } from 'antd';
import { MinusCircleOutlined, PlusCircleOutlined } from '@ant-design/icons';
import axois from 'axios';
import fileDownload from 'js-file-download';
import moment from 'moment';
import axios from 'axios';
import qs from 'qs';

/**
 * 标签文档表单
 */
export default class extends FormBase {
  /** @inheritdoc */
  constructor(props) {
    super(props);

    this.state = {
      ...super.state,
      isLoadingProducts: false,
      isProductModalShown: false,
      products: [],
      asin: '',
      keyword: '',
    };

    this.getProductTable = this.getProductTable.bind(this);
    this.loadProducts = this.loadProducts.bind(this);
  }

  validateFormData() {
    return new Promise(async (resolve, reject) => {
      this.getFormRef()
        .current.validateFields()
        .then((data) => {
          if (!data.pallets || data.pallets.length === 0) {
            reject('Please add at least 1 pallet.');
            return;
          } else if (data.pallets.length > 10) {
            reject('The current EDI system only supports up to 10 pallets.');
            return;
          }

          const lastPalletNum = data.pallets[data.pallets.length - 1].pallet_num_to;

          if (data.total_pallet < lastPalletNum) {
            reject('The last pallet number is greater than the total pallet');
            return;
          }

          resolve(data);
        })
        .catch(() => {
          reject();
        });
    });
  }

  /** @inheritdoc */
  handleFileGenerate(data) {
    if (!this.props.file) {
      message.error('请选择相关754文件.');
      return;
    }

    this.validateFormData()
      .then(() => {
        this.setState({ isGenerating: true }, () => {
          const { file } = this.props;

          axois
            .post(`/api/generate/edi/label-excel/${file.name}`, data, {
              responseType: 'arraybuffer',
            })
            .then((response) => {
              fileDownload(response.data, `${this.getFileName(this.props.file)}.xlsx`);
              message.success('成功生成标签文件.');
              this.setState({ isGenerating: false });
            })
            .catch((rejected) => {
              console.log(rejected);
              message.error('生成请求出错, 请稍候再试...');
            });
        });
      })
      .catch((rejected) => {
        if (Boolean(rejected)) {
          message.error(rejected);
        }
      });
  }

  /** @inheritdoc */
  getFormDefaultValues() {
    return {
      pallets: [
        {
          pallet_num: 1,
          pallet_num_to: 1,
          package_in_pallet: 1,
        },
      ],
    };
  }

  /**
   * 加载商品列表.
   *
   * @return {Promise<unknown>}
   */
  loadProducts() {
    return new Promise((resolve, reject) => {
      const data = {};

      if (Boolean(this.state.keyword)) {
        data.keyword = this.state.keyword;
      }

      if (Boolean(this.state.asin)) {
        data.asin = this.state.asin;
      }

      const query = qs.stringify(data);

      axios
        .get(`/api/products${Boolean(query) ? `?${query}` : ''}`)
        .then((response) => {
          resolve(response.data.result.products);
        })
        .catch(reject);
    });
  }

  /**
   * 获取商品表格.
   *
   * @return {null|React}
   *   商品表格元素.
   */
  getProductTable() {
    if (!this.state.isProductModalShown) {
      return null;
    }

    const productColumns = [
      {
        title: 'Description',
        key: 'product_title',
        dataIndex: 'product_title',
      },
      {
        title: 'ASIN',
        key: 'asin',
        dataIndex: 'asin',
      },
      {
        title: '',
        key: 'action',
        render: (text, record) => (
          <span>
            <Button size='small' title='导入商品' onClick={() => this.onImportProduct(record)}>
              导入
            </Button>
          </span>
        ),
      },
    ];

    return (
      <div>
        <Row type='flex' style={{ marginBottom: 10 }}>
          <Col span={6}>
            <Input.Search
              placeholder='搜索商品名'
              value={this.state.keyword}
              onChange={(e) => this.setState({ keyword: e.target.value })}
              size='small'
              onSearch={() => this.onLoadProducts()}
            />
          </Col>
          <Col span={6} offset={1}>
            <Input.Search
              placeholder='搜索ASIN'
              value={this.state.asin}
              onChange={(e) => this.setState({ asin: e.target.value })}
              size='small'
              onSearch={() => this.onLoadProducts()}
            />
          </Col>
        </Row>
        <Table dataSource={this.state.products || []} columns={productColumns} />
      </div>
    );
  }

  /**
   * 处理导入商品Asin至表单.
   *
   * @param {Object} product
   *   商品数据.
   */
  onImportProduct(product) {
    const form = this.getFormRef();

    form.current.setFieldsValue({
      asin: product.asin,
    });

    this.setState({ isProductModalShown: false });
  }

  /**
   * 处理加载商品列表.
   *
   * @param {string} type
   *   商品类型.
   */
  onLoadProducts() {
    this.setState({ isLoadingProducts: true }, () => {
      this.loadProducts()
        .then((products) => {
          this.setState({ products, isLoadingProducts: false, isProductModalShown: true });
        })
        .catch((rejected) => {
          this.setState({ isLoadingProducts: false }, () => {
            console.log(rejected);
            message.error('加载商品出错, 请稍候再试');
          });
        });
    });
  }

  /** @inheritdoc */
  onDirectSubmit() {
    this.getFormRef()
      .current.validateFields()
      .then(data => this.displayRedirectSubmitConfirm(data))
      .then((data) => {
        this.setState({ isGenerating: true }, () => {
          const { file } = this.props;

          axois
            .post(`/api/generate/edi/label-excel/${file.name}?submit=1`, {
              titleOverride: this.state.submittingTitle,
              ...data,
            })
            .then((response) => {
              if (response.data.status === 'ok') {
                message.success('成功提交标签文档.');
                this.setState({ isGenerating: false, showSubmitConfirm: false });
              } else {
                message.error(`提交标签文档出错: ${response.data.errorMessage}`);
                this.setState({ isGenerating: false });
              }
            })
            .catch((rejected) => {
              console.log(rejected);
              message.error('提交请求出错, 请稍候再试...');
            });
        });
      });
  }

  /** @inheritdoc */
  getFileName(file) {
    return `label-excel-${moment().format('MMDD')}-PO-${file.po_number}`;
  }

  /** @inheritdoc */
  getFormItems() {
    const twoColumnLayout = this.getTwoColumnSpans();

    return (
      <React.Fragment>
        <Form.Item wrapperCol={{ span: 12, offset: 5 }}>
          <Button size='small' onClick={() => this.onLoadProducts()} loading={this.state.isLoadingProducts}>
            导入商品
          </Button>
        </Form.Item>
        <Form.Item name='asin' label='ASIN' rules={[{ required: true }]}>
          <Input size='small' />
        </Form.Item>
        <Row>
          <Col {...twoColumnLayout.first.outer}>
            <Form.Item name='carrier' label='Carrier' rules={[{ required: true }]} {...twoColumnLayout.first.inner}>
              <Input size='small' />
            </Form.Item>
          </Col>
          <Col {...twoColumnLayout.second.outer}>
            <Form.Item
              name='carrier_code'
              label='Carrier Code'
              rules={[{ required: true }]}
              {...twoColumnLayout.second.inner}>
              <Input size='small' />
            </Form.Item>
          </Col>
        </Row>
        <Form.Item name='pro' label='TRACKING NO. (PRO)'>
          <Input size='small' />
        </Form.Item>
        <Form.Item name='total_pallet' label='Total Pallet' rules={[{ required: true }]}>
          <InputNumber size='small' />
        </Form.Item>
        <Form.List name='pallets'>
          {(fields, actions) => (
            <div style={{ marginBottom: 20 }}>
              {fields.map((field, index) => {
                return (
                  <Row type='flex' align='middle' key={field.key}>
                    <Col offset={2} span={6}>
                      <Form.Item
                        style={{ marginBottom: 0 }}
                        name={[index, 'pallet_num']}
                        label='Pallet Number'
                        rules={[{ required: true }]}
                        labelCol={{ span: 12 }}
                        wrapperCol={{ span: 10 }}>
                        <InputNumber size='small' />
                      </Form.Item>
                    </Col>
                    <Col span={5}>
                      <Form.Item
                        name={[index, 'pallet_num_to']}
                        style={{ marginBottom: 0 }}
                        label='To'
                        rules={[{ required: true }]}
                        labelCol={{ span: 8 }}
                        wrapperCol={{ span: 10 }}>
                        <InputNumber size='small' />
                      </Form.Item>
                    </Col>
                    <Col span={6}>
                      <Form.Item
                        name={[index, 'package_in_pallet']}
                        style={{ marginBottom: 0 }}
                        label='Cartons in Pallet'
                        rules={[{ required: true }]}
                        labelCol={{ span: 14 }}
                        wrapperCol={{ span: 10 }}>
                        <InputNumber size='small' />
                      </Form.Item>
                    </Col>
                    <Col span={3} style={{ textAlign: 'right' }}>
                      {index === 0 && (
                        <Button
                          size='small'
                          icon={<PlusCircleOutlined />}
                          title='新增Pallet'
                          onClick={() => actions.add()}
                        />
                      )}
                      {index > 0 && (
                        <Button
                          size='small'
                          icon={<MinusCircleOutlined />}
                          title='删除Pallet'
                          type='danger'
                          onClick={() => actions.remove(field.name)}
                        />
                      )}
                    </Col>
                  </Row>
                );
              })}
            </div>
          )}
        </Form.List>
        <Modal
          width={600}
          onCancel={() => this.setState({ isProductModalShown: false })}
          onOk={() => this.setState({ isProductModalShown: false })}
          visible={this.state.isProductModalShown}
          afterClose={() => this.setState({ products: [], keyword: '', asin: '' })}>
          {this.getProductTable()}
        </Modal>
      </React.Fragment>
    );
  }
}
