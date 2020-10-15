import React from 'react';
import FormBaseWithAddressLoader from "./FormBaseWithAddressLoader";
import { Form, DatePicker, Input, Row, Col, InputNumber, message } from 'antd';
import axios from 'axios';
import fileDownload from 'js-file-download';
import moment from 'moment';

import WeightSelect from '../EdiFormComponents/WeightSelect';
import VolumeSelect from '../EdiFormComponents/VolumeSelect';
import TypeSelect from '../EdiFormComponents/TypeSelect';

/**
 * 753文档表单.
 */
export default class extends FormBaseWithAddressLoader {
  constructor(props) {
    super(props);

    this.state = {
      ...super.state,
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
      data.freight_ready_date = data.freight_ready_date.format('YYYYMMDD');

      axios
        .post(`/api/generate/edi/753/${this.props.file.name}`, data, {
          responseType: 'arraybuffer',
        })
        .then((response) => {
          fileDownload(response.data, `${this.getFileName(this.props.file)}.xlsx`);
          message.success('成功生成753文件.');
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
      weight_unit: 'K',
      volume_unit: 'N',
      type: 'CTN',
    };
  }

  /** @inheritdoc */
  onDirectSubmit() {
    this.getFormRef()
      .current.validateFields()
      .then(data => this.displayRedirectSubmitConfirm(data))
      .then((data) => {
        this.setState({ isGenerating: true }, () => {
          data.freight_ready_date = data.freight_ready_date.format('YYYYMMDD');

          axios
            .post(`/api/generate/edi/753/${this.props.file.name}?submit=1`, {
              titleOverride: this.state.submittingTitle,
              ...data,
            })
            .then((response) => {
              if (response.data.status === 'ok') {
                message.success('成功提交753文件.');
                this.setState({ isGenerating: false, showSubmitConfirm: false });
              } else {
                message.success(`提交753文件出错: ${response.data.errorMessage}`);
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
    return `753-${moment().format('MMDD')}-PO-${file.po_number}`;
  }

  /** @inheritdoc */
  getFormItems() {
    const twoColumnLayout = this.getTwoColumnSpans();

    return (
      <React.Fragment>
        <Form.Item name='freight_ready_date' label='Freight Ready Date' rules={[{ required: true }]}>
          <DatePicker size='small' />
        </Form.Item>
        {this.getShipFromTable()}
        {this.getShipToForm()}
        <Row>
          <Col {...twoColumnLayout.first.outer}>
            <Form.Item
              name='total_pallet'
              label='Total Number of Pallets'
              rules={[{ required: true }]}
              {...twoColumnLayout.first.inner}>
              <InputNumber size='small' />
            </Form.Item>
          </Col>
          <Col {...twoColumnLayout.second.outer}>
            <Form.Item
              name='total_carton'
              label='Total Number of Cartons'
              rules={[{ required: true }]}
              {...twoColumnLayout.second.inner}>
              <InputNumber size='small' />
            </Form.Item>
          </Col>
        </Row>
        <Row>
          <Col {...twoColumnLayout.first.outer}>
            <Form.Item name='type' label='Type' rules={[{ required: true }]} {...twoColumnLayout.first.inner}>
              <TypeSelect />
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
              <WeightSelect type='753' />
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
              <VolumeSelect />
            </Form.Item>
          </Col>
          <Col {...twoColumnLayout.second.outer}>
            <Form.Item name='volume' label='Volume' rules={[{ required: true }]} {...twoColumnLayout.second.inner}>
              <InputNumber size='small' />
            </Form.Item>
          </Col>
        </Row>
        {super.getFormItems()}
      </React.Fragment>
    );
  }
}
