import React from 'react';
import { Form, Button, Table, Row, Col } from 'antd';
import FormStyles from './EdiFormBase.module.scss';

export default class extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			files: [],
		};

		this.getFormItems = this.getFormItems.bind(this);
	}

	getFormItems() {}

	buildFileContent() {

	}

	handleFileGenerate() {}

	handleEditingFileSwitch() {

	}

	render() {
		const fileColumns = [

		];

		const layout = {
			labelCol: { span: 6 },
			wrapperCol: { span: 8 },
		};

		return <div className={FormStyles['edi-excel-generator']}>
			<Form onFinish={ this.handleFileGenerate.bind(this) } {...layout} className="generator-form">
				<Form.Item wrapperCol={{ span: 8, offset: 6 }}>
					<h3>请填写以下内容并点击生成:</h3>
				</Form.Item>
				{this.getFormItems()}
				<Form.Item wrapperCol={{ span: 8, offset: 6 }}>
					<Button type="primary" htmlType="submit">生成</Button>
				</Form.Item>
			</Form>
		</div>
	}
}
