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
			files: [],
		};

		this.getFormItems = this.getFormItems.bind(this);
	}

	onClearForm() {
		Modal.confirm({
			title: '确认清空当前内容?',
			onOk: () => this.formRef.current.resetFields()
		});
	}

	render() {
		const layout = {
			labelCol: { span: 6 },
			wrapperCol: { span: 14 },
		};

		return <div className={FormStyles['edi-excel-generator']}>
			<Form ref={this.formRef} onFinish={ this.handleFileGenerate.bind(this) } {...layout} className="generator-form">
				<Form.Item wrapperCol={{ span: 12, offset: 6 }}>
					<h3>请填写以下内容并点击生成:</h3>
				</Form.Item>
				{this.getFormItems()}
				<Form.Item wrapperCol={{ span: 12, offset: 6 }}>
					<Button type="primary" htmlType="submit">生成</Button>
					&nbsp;&nbsp;
					<Button onClick={this.onClearForm.bind(this)} htmlType="button">清空</Button>
				</Form.Item>
			</Form>
		</div>
	}
}
