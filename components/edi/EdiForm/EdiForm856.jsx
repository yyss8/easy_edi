import React from 'react';
import FormBase from './EdiFormBase';
import { Form, DatePicker, Input, Row, Col, InputNumber, message, Button } from 'antd';
import axois from 'axios';
import fileDownload from 'js-file-download';
import moment from 'moment';

import VolumeSelect from '../EdiFormComponents/VolumeSelect';
import WeightSelect from '../EdiFormComponents/WeightSelect';
import TypeSelect from '../EdiFormComponents/TypeSelect';

/**
 * 856文档表单.
 */
export default class extends FormBase {
  validateFormData() {
    return new Promise(async (resolve, reject) => {
      const data = await this.getFormRef().current.validateFields();
      const response = await axois.post(`/api/product/${this.props.file.asin}`, {
        shipped: data.to_be_shipped,
      });
    });
  }

  /** @inheritdoc */
  handleFileGenerate(data) {
    if (!this.props.file) {
      message.error('请选择相关754文件.');
      return;
    }

    this.setState({ isGenerating: true }, () => {
      data.ship_date = data.ship_date.format('YYYYMMDD');

      axois
        .post(`/api/generate/edi/856/${this.props.file.name}`, data, {
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
  }

  /** @inheritdoc */
  getFormDefaultValues() {
    return {
      weight_unit: 'KG',
      volume_unit: 'CI',
      type_unit: 'EA',
      type: 'CTN',
      stacked_pallets: 0,
    };
  }

  /** @inheritdoc */
  onDirectSubmit() {
    this.getFormRef()
      .current.validateFields()
      .then((data) => {
        this.setState({ isGenerating: true }, () => {
          data.ship_date = data.ship_date.format('YYYYMMDD');

          axois
            .post(`/api/generate/edi/856/${this.props.file.name}?submit=1`, {
              titleOverride: this.state.submittingTitle,
              ...data,
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
        <Row>
          <Col {...twoColumnLayout.first.outer}>
            <Form.Item name='stacked_pallets' label='Total Stacked Pallets' {...twoColumnLayout.first.inner}>
              <InputNumber size='small' />
            </Form.Item>
          </Col>
          <Col {...twoColumnLayout.second.outer}>
            <Form.Item
              name='unstacked_pallets'
              label='Total Unstacked Pallets'
              rules={[{ required: true }]}
              {...twoColumnLayout.second.inner}>
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
          <Col {...twoColumnLayout.second.outer}>
            <Form.Item name='type_unit' label='Unit' rules={[{ required: true }]} {...twoColumnLayout.first.inner}>
              <Input size='small' />
            </Form.Item>
          </Col>
        </Row>
        <Row>
          <Col {...twoColumnLayout.first.outer}>
            <Form.Item name='type' label='Type' rules={[{ required: true }]} {...twoColumnLayout.first.inner}>
              <TypeSelect />
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
              name='weight_unit'
              label='Weight Unit'
              rules={[{ required: true }]}
              {...twoColumnLayout.first.inner}>
              <WeightSelect type='856' />
            </Form.Item>
          </Col>
          <Col {...twoColumnLayout.second.outer}>
            <Form.Item name='weight' label='Weight' rules={[{ required: true }]} {...twoColumnLayout.second.inner}>
              <Input size='small' />
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
      </React.Fragment>
    );
  }
}
