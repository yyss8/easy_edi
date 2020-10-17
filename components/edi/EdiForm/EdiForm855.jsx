import React from 'react';
import FormBase from './EdiFormBase';
import { Form, Row, Col, InputNumber, message, Select } from 'antd';
import axois from 'axios';
import fileDownload from 'js-file-download';
import moment from 'moment';

/**
 * 855文档表单.
 */
export default class extends FormBase {
  constructor(props) {
    super(props);

    this.state = {
      ...super.state,
      isLoadingAddresses: false,
      isAddressModalShown: false,
      loadingType: 'from',
      keyword: '',
    };
  }

  /** @inheritdoc */
  handleFileGenerate(data) {
    if (!this.props.file) {
      message.error('请选择相关850文件.');
      return;
    }

    this.setState({ isGenerating: true }, () => {
      axois
        .post(`/api/generate/edi/855/${this.props.file.name}`, data, {
          responseType: 'arraybuffer',
        })
        .then((response) => {
          fileDownload(response.data, `${this.getFileName(this.props.file)}.xlsx`);
          message.success('成功生成855文件.');
          this.setState({ isGenerating: false });
        })
        .catch((rejected) => {
          console.log(rejected);
          message.error('生成请求出错, 请稍候再试...');
        });
    });
  }

  /** @inheritdoc */
  onDirectSubmit() {
    this.getFormRef()
      .current.validateFields()
      .then((data) => this.displayRedirectSubmitConfirm(data))
      .then((data) => {
        this.setState({ isGenerating: true }, () => {
          axois
            .post(`/api/generate/edi/855/${this.props.file.name}?submit=1`, {
              titleOverride: this.state.submittingTitle,
              ...data,
            })
            .then((response) => {
              if (response.data.status === 'ok') {
                message.success('成功提交855文件.');
                this.setState({ isGenerating: false, showSubmitConfirm: false });
              } else {
                message.success(`提交855文件出错: ${response.data.errorMessage}`);
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
    return `855-${moment().format('MMDD')}-PO-${file.po_number}`;
  }

  getNewQuantity() {
    const formRef = this.getFormRef().current;
    const products = formRef.getFieldValue('products');
    const newQuantity = products.reduce((a, b) => a + Number(b.quantity), 0);
    formRef.setFieldsValue({ quantity: newQuantity });
  }

  /** @inheritdoc */
  getFormItems() {
    const twoColumnLayout = this.getTwoColumnSpans();

    return (
      <React.Fragment>
        <Row>
          <Col {...twoColumnLayout.first.outer}>
            <Form.Item name='quantity' label='Quantity' {...twoColumnLayout.first.inner}>
              <InputNumber size='small' disabled />
            </Form.Item>
          </Col>
        </Row>
        <Form.List name='products'>
          {(fields) => (
            <div style={{ marginBottom: 20 }}>
              {fields.map((field, index) => {
                return (
                  <Row type='flex' align='middle' key={field.key}>
                    <Col offset={0} span={3}>
                      <b>{this.props.file.products[index].asin}</b>
                    </Col>
                    <Col span={5}>
                      <Form.Item
                        name={[index, 'quantity']}
                        style={{ marginBottom: 0 }}
                        label='Quantity'
                        rules={[{ required: true }]}
                        labelCol={{ span: 10 }}
                        wrapperCol={{ span: 12 }}>
                        <InputNumber size='small' onChange={this.getNewQuantity.bind(this)} />
                      </Form.Item>
                    </Col>
                    <Col span={5}>
                      <Form.Item
                        name={[index, 'price']}
                        style={{ marginBottom: 0 }}
                        label='Unit Price'
                        rules={[{ required: true }]}
                        labelCol={{ span: 10 }}
                        wrapperCol={{ span: 12 }}>
                        <InputNumber size='small' />
                      </Form.Item>
                    </Col>
                    <Col span={5}>
                      <Form.Item
                        name={[index, 'action']}
                        style={{ marginBottom: 0 }}
                        label='Action'
                        rules={[{ required: true }]}
                        labelCol={{ span: 10 }}
                        wrapperCol={{ span: 12 }}>
                        <Select>
													<Select.Option value="IA">Accept</Select.Option>
													<Select.Option value="IR">Cancel</Select.Option>
												</Select>
                      </Form.Item>
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
