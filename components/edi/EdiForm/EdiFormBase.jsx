import React from 'react';
import { Form, Button, Modal, Input, message } from 'antd';
import FormStyles from './EdiFormBase.module.scss';
import moment from 'moment';

/**
 * 文档表单基础组件.
 */
export default class extends React.Component {
  formRef = React.createRef();

  /** @inheritdoc */
  constructor(props) {
    super(props);

    this.state = {
      isGenerating: false,
      showSubmitConfirm: false,
      submittingTitle: '',
    };

    this.getFormItems = this.getFormItems.bind(this);
    this.getFormRef = this.getFormRef.bind(this);
  }

  /**
   * 处理清空表单内容.
   */
  onClearForm() {
    Modal.confirm({
      title: '确认清空当前内容?',
      onOk: () => this.getFormRef().current.resetFields(),
    });
  }

  /**
   * 获取表单ref
   *
   * @return {React.RefObject<unknown>}
   */
  getFormRef() {
    return this.props.parentRef || this.formRef;
  }

  /**
   * 获取不同文档类型独有的表单元素.
   */
  getFormItems() {
    return null;
  }

  /**
   * 获取表单默认数据.
   *
   * @return {{}}
   */
  getFormDefaultValues() {
    return {};
  }

  /**
   * 获取两列相关元素的span以及offset.
   *
   * @return {{first: {outer: {offset: number, span: number}, inner: {wrapperCol: {span: number}, labelCol: {span: number}}}, second: {outer: {span: number}, inner: {wrapperCol: {span: number}, labelCol: {span: number}}}}}
   */
  getTwoColumnSpans() {
    return {
      first: {
        outer: {
          offset: 0,
          span: 10,
        },
        inner: {
          labelCol: { span: 12 },
          wrapperCol: { span: 12 },
        },
      },
      second: {
        outer: {
          span: 13,
        },
        inner: {
          labelCol: { span: 12 },
          wrapperCol: { span: 12 },
        },
      },
    };
  }

  /**
   * 直接提交modal关闭后数据处理.
   */
  afterSubmitClose() {
    this.setState({
      submittingTitle: false,
    });
  }

  /**
   * 处理表单数据直接提交.
   */
  onDirectSubmit() {}

  validateFormData() {
    return this.getFormRef().current.validateFields();
  }

  /**
   * 显示直接提交modal.
   */
  onShowSubmitModal() {
    this.validateFormData()
      .then(() => {
        this.setState({
          showSubmitConfirm: true,
          submittingTitle: this.getFileName(this.props.file),
        });
      })
      .catch((rejected) => {
        if (Boolean(rejected)) {
          message.error(rejected);
        }
      });
  }

  /**
   * 获取生成文件名称.
   *
   * @param {Object} file
   *   当前文档数据.
   *
   * @return {string}
   */
  getFileName(file) {
    return '';
  }

  /** @inheritdoc */
  render() {
    const layout = {
      labelCol: { span: 5 },
      wrapperCol: { span: 18 },
    };

    const ref = this.getFormRef();

    return (
      <div className={FormStyles['edi-excel-generator']}>
        <Form
          ref={ref}
          onFinish={this.handleFileGenerate.bind(this)}
          initialValues={this.getFormDefaultValues()}
          {...layout}
          className='generator-form'>
          <Form.Item wrapperCol={{ span: 12, offset: 5 }}>
            <h3>请填写以下内容并点击生成:</h3>
          </Form.Item>
          {this.getFormItems()}
          <Form.Item wrapperCol={{ span: 12, offset: 5 }}>
            <Button loading={this.state.isGenerating} type='primary' title='生成当前文档文件' htmlType='submit'>
              生成
            </Button>
            &nbsp;&nbsp;
            <Button onClick={this.onClearForm.bind(this)} title='清空当前表单内容' htmlType='button'>
              清空
            </Button>
            &nbsp;&nbsp;
            <Button onClick={this.onShowSubmitModal.bind(this)} title='直接提交当前数据' htmlType='button'>
              提交
            </Button>
          </Form.Item>
        </Form>
        <Modal
          visible={this.state.showSubmitConfirm}
          title='确认提交当前数据?'
          afterClose={this.afterSubmitClose.bind(this)}
          onOk={this.onDirectSubmit.bind(this)}
          okText='提交'
          cancelText='取消'
          confirmLoading={this.state.isGenerating}
          onCancel={() => this.setState({ showSubmitConfirm: false })}>
          <Form.Item style={{ marginBottom: 5 }} label='文件名称'>
            <Input
              size='small'
              value={this.state.submittingTitle}
              onChange={(e) => this.setState({ submittingTitle: e.target.value })}
            />
          </Form.Item>
          <h6>请勿带有#号, 否则将会无法下载归档文件.</h6>
        </Modal>
      </div>
    );
  }
}
