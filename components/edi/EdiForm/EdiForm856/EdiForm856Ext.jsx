import React from 'react';
import FormBase from '../EdiFormBase';
import { Form, DatePicker, Input, Row, Col, InputNumber, message, Radio, Button } from 'antd';
import { MinusCircleOutlined, PlusCircleOutlined } from '@ant-design/icons';
import axois from 'axios';
import fileDownload from 'js-file-download';
import moment from 'moment';
import updater from 'immutability-helper';

import VolumeSelect from '../../EdiFormComponents/VolumeSelect';
import WeightSelect from '../../EdiFormComponents/WeightSelect';

/**
 * 856文档表单.
 */
export default class extends FormBase {
  /** @inheritdoc */
  constructor(props) {
    super(props);

    this.state = {
      ...super.state,
      stackType: 'unstacked',
    };
  }

  /** @inheritdoc */
  validateFormData() {
    return new Promise((resolve, reject) => {
      super.validateFormData().then(async (data) => {
        try {
          const response = await axois.post(`/api/product/${this.props.file.asin}`, {
            shipped: data.total_carton,
            total: data.to_be_shipped,
          });

          const checkData = response.data;

          if (checkData.status === 'ok') {
            if (checkData.result.not_found === 1 || checkData.result.match === 0) {
              this.displayConfirmMessage(
                `${
                  checkData.result.not_found === 1
                    ? 'There is no product found that matches the ASIN'
                    : "The number of the items to be shipped doesn't match with the product"
                }, continue submitting the file?`,
                data,
                resolve,
                reject
              );
              return;
            }
          } else {
            this.displayConfirmMessage('Matching request failed, continue submitting the file?', data, resolve, reject);
            return;
          }

          resolve(data);
        } catch (e) {
          this.displayConfirmMessage('Matching request failed, continue submitting the file?', data, resolve, reject);
        }
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
        const { stackType } = this.state;

        this.setState({ isGenerating: true }, () => {
          const prepared = updater(data, {
            ship_date: {
              $set: data.ship_date.format('YYYYMMDD'),
            },
            expiration: {
              $set:
                Boolean(data.expiration) && moment.isMoment(data.expiration) ? data.expiration.format('YYYYMMDD') : '',
            },
            [stackType === 'unstacked' ? 'stacked_pallets' : 'unstacked_pallets']: {
              $set: 0,
            },
          });

          axois
            .post(`/api/generate/edi/856-ext/${this.props.file.name}`, prepared, {
              responseType: 'arraybuffer',
            })
            .then((response) => {
              fileDownload(response.data, `${this.getFileName(this.props.file)}.xlsx`);
              message.success('成功生成856文件.');
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
      weight_unit: 'KG',
      volume_unit: 'CI',
      type_unit: 'EA',
      stacked_pallets: 0,
      unstacked_pallets: 0,
      stack_type: 'unstacked',
      products: [
        {
          sscc: '',
          quantity: 1,
          weight: 0,
          upc: '',
          unit: 'EA',
        },
      ],
    };
  }

  /** @inheritdoc */
  onDirectSubmit() {
    this.getFormRef()
      .current.validateFields()
      .then((data) => this.displayRedirectSubmitConfirm(data))
      .then((data) => {
        this.setState({ isGenerating: true }, () => {
          const { stackType } = this.state;
          const prepared = updater(data, {
            ship_date: {
              $set: data.ship_date.format('YYYYMMDD'),
            },
            expiration: {
              $set:
                Boolean(data.expiration) && moment.isMoment(data.expiration) ? data.expiration.format('YYYYMMDD') : '',
            },
            [stackType === 'unstacked' ? 'stacked_pallets' : 'unstacked_pallets']: {
              $set: 0,
            },
          });

          axois
            .post(`/api/generate/edi/856-ext/${this.props.file.name}?submit=1`, {
              titleOverride: this.state.submittingTitle,
              ...prepared,
            })
            .then((response) => {
              if (response.data.status === 'ok') {
                message.success('成功提交856文件.');
                this.setState({ isGenerating: false, showSubmitConfirm: false });
              } else {
                message.error(`提交856文件出错: ${response.data.errorMessage}`);
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
    return `856-${moment().format('MMDD')}-PO-${file.po_number}`;
  }

  /** @inheritdoc */
  getFormItems() {
    const twoColumnLayout = this.getTwoColumnSpans();
    const { stackType } = this.state;
    const unstackOuterColSpan = stackType === 'unstacked' ? twoColumnLayout.first.outer : twoColumnLayout.second.outer;
    const unstackInnerColSpan = stackType === 'unstacked' ? twoColumnLayout.first.inner : twoColumnLayout.second.inner;

    return (
      <React.Fragment>
        <Form.Item name='ship_date' label='Ship/Delivery Date' rules={[{ required: true }]}>
          <DatePicker size='small' />
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
        <Row>
          <Col {...twoColumnLayout.first.outer}>
            <Form.Item
              name='pro'
              label='TRACKING NO. (PRO)'
              rules={[{ required: true }]}
              {...twoColumnLayout.first.inner}>
              <Input size='small' />
            </Form.Item>
          </Col>
        </Row>
        <Form.Item label='Pallet Stacking Type' rules={[{ required: true }]}>
          <Radio.Group onChange={(e) => this.setState({ stackType: e.target.value })} value={stackType}>
            <Radio value='unstacked'>Unstacked</Radio>
            <Radio value='stacked'>Stacked</Radio>
            <Radio value='both'>Both</Radio>
          </Radio.Group>
        </Form.Item>
        <Row>
          {(stackType === 'stacked' || stackType === 'both') && (
            <Col {...twoColumnLayout.first.outer}>
              <Form.Item
                rules={[{ required: stackType === 'stacked' || stackType === 'both' }]}
                name='stacked_pallets'
                label='Total Stacked Pallets'
                {...twoColumnLayout.first.inner}>
                <InputNumber size='small' />
              </Form.Item>
            </Col>
          )}
          {(stackType === 'unstacked' || stackType === 'both') && (
            <Col {...unstackOuterColSpan}>
              <Form.Item
                name='unstacked_pallets'
                label='Total Unstacked Pallets'
                rules={[{ required: stackType === 'unstacked' || stackType === 'both' }]}
                {...unstackInnerColSpan}>
                <InputNumber size='small' />
              </Form.Item>
            </Col>
          )}
        </Row>

        <Row>
          <Col {...twoColumnLayout.first.outer}>
            <Form.Item
              name='weight_unit'
              label='Weight Unit'
              rules={[{ required: true }]}
              {...twoColumnLayout.first.inner}>
              <WeightSelect type='856' />
            </Form.Item>
          </Col>

          <Col {...twoColumnLayout.second.outer}>
            <Form.Item
              name='total_carton'
              label='Total Number of Ctn (Pkg)'
              rules={[{ required: true }]}
              {...twoColumnLayout.second.inner}>
              <InputNumber size='small' />
            </Form.Item>
          </Col>
        </Row>

        <Row>
          <Col {...twoColumnLayout.first.outer}>
            <Form.Item
              name='volume_unit'
              label='Volume Unit'
              rules={[{ required: true }]}
              {...twoColumnLayout.first.inner}>
              <VolumeSelect type='856' />
            </Form.Item>
          </Col>
          <Col {...twoColumnLayout.second.outer}>
            <Form.Item name='volume' label='Volume' rules={[{ required: true }]} {...twoColumnLayout.second.inner}>
              <InputNumber size='small' />
            </Form.Item>
          </Col>
        </Row>

        <Row>
          <Col {...twoColumnLayout.first.outer}>
            <Form.Item
              name='to_be_shipped'
              label='To Be Shipped'
              rules={[{ required: true }]}
              {...twoColumnLayout.second.inner}>
              <InputNumber size='small' />
            </Form.Item>
          </Col>
        </Row>

        <Form.List name='products'>
          {(fields, actions) => (
            <div style={{ marginBottom: 20 }}>
              {fields.map((field, index) => {
                return (
                  <Row type='flex' align='middle' key={field.key}>
                    <Col offset={2} span={6}>
                      <Form.Item
                        style={{ marginBottom: 0 }}
                        name={[index, 'sscc']}
                        label='SSCC'
                        rules={[{ required: true }]}
                        labelCol={{ span: 12 }}
                        wrapperCol={{ span: 10 }}>
                        <Input size='small' />
                      </Form.Item>
                    </Col>
                    <Col span={4}>
                      <Form.Item
                        name={[index, 'quantity']}
                        style={{ marginBottom: 0 }}
                        label='Quantity'
                        rules={[{ required: true }]}
                        labelCol={{ span: 10 }}
                        wrapperCol={{ span: 12 }}>
                        <InputNumber size='small' />
                      </Form.Item>
                    </Col>
                    <Col span={3}>
                      <Form.Item
                        name={[index, 'weight']}
                        style={{ marginBottom: 0 }}
                        label='Weight'
                        rules={[{ required: true }]}
                        labelCol={{ span: 14 }}
                        wrapperCol={{ span: 10 }}>
                        <InputNumber size='small' />
                      </Form.Item>
                    </Col>
                    <Col span={3}>
                      <Form.Item
                        name={[index, 'upc']}
                        style={{ marginBottom: 0 }}
                        label='UPC'
                        rules={[{ required: true }]}
                        labelCol={{ span: 14 }}
                        wrapperCol={{ span: 10 }}>
                        <Input size='small' />
                      </Form.Item>
                    </Col>
                    <Col span={3}>
                      <Form.Item
                        name={[index, 'unit']}
                        style={{ marginBottom: 0 }}
                        label='Unit'
                        rules={[{ required: true }]}
                        labelCol={{ span: 12 }}
                        wrapperCol={{ span: 12 }}>
                        <Input size='small' />
                      </Form.Item>
                    </Col>
                    <Col span={2} style={{ textAlign: 'right' }}>
                      {index === 0 && (
                        <Button
                          size='small'
                          icon={<PlusCircleOutlined />}
                          title='新增商品'
                          onClick={() => actions.add()}
                        />
                      )}
                      {index > 0 && (
                        <Button
                          size='small'
                          icon={<MinusCircleOutlined />}
                          title='删除商品'
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
      </React.Fragment>
    );
  }
}
