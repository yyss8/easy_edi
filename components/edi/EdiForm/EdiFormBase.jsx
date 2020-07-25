import React from 'react';
import { Form, Button, Modal } from 'antd';
import FormStyles from './EdiFormBase.module.scss';

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
			onOk: () => this.getFormRef().current.resetFields()
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

	getFormDefaultValues() {
		return {};
	}

	getTwoColumnSpans() {
		return {
			first: {
				outer: {
					offset: 0,
					span: 10,
				},
				inner: {
					labelCol: { span: 12 },
					wrapperCol: { span: 12},
				}
			},
			second: {
				outer: {
					span: 13,
				},
				inner: {
					labelCol: { span: 12 },
					wrapperCol: { span: 12 },
				}
			}
		};
	}

	render() {
		const layout = {
			labelCol: { span: 5 },
			wrapperCol: { span: 18 },
		};

		const ref = this.getFormRef();

		return <div className={FormStyles['edi-excel-generator']}>
			<Form ref={ref} onFinish={ this.handleFileGenerate.bind(this) } initialValues={ this.getFormDefaultValues() } {...layout} className="generator-form">
				<Form.Item wrapperCol={{ span: 12, offset: 5 }}>
					<h3>请填写以下内容并点击生成:</h3>
				</Form.Item>
				{this.getFormItems()}
				<Form.Item wrapperCol={{ span: 12, offset: 5 }}>
					<Button loading={ this.state.isGenerating } type="primary" htmlType="submit">生成</Button>
					&nbsp;&nbsp;
					<Button onClick={this.onClearForm.bind(this)} htmlType="button">清空</Button>
				</Form.Item>
			</Form>
		</div>
	}
}
