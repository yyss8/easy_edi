import React from 'react';
import FormBase from './EdiFormBase';
import { Form, DatePicker, Input, Row, Col, InputNumber, message, Button, Modal, Table } from 'antd';
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

	prepareProducts(products) {
		return products.map(product => ({
			...product,
			date_1: moment.isMoment(product.date_1) ? product.date_1.format('YYYYMMDD') : '',
			date_2: moment.isMoment(product.date_2) ? product.date_2.format('YYYYMMDD') : '',
		}));
	}

	/** @inheritdoc */
	handleFileGenerate(data) {
		if (!this.props.file) {
			message.error('请选择相关850文件.');
			return;
		}

		this.setState({ isGenerating: true }, () => {
			data.products = this.prepareProducts(data.products);
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
			.then(data => this.displayRedirectSubmitConfirm(data))
			.then((data) => {
				this.setState({ isGenerating: true }, () => {
					data.products = this.prepareProducts(data.products);
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
		formRef.setFieldsValue({quantity: newQuantity});
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
					{(fields, actions) => (
						<div style={{ marginBottom: 20 }}>
							{fields.map((field, index) => {
								return (
									<Row type='flex' align='middle' key={field.key}>
										<Col span={2}>
											<b>{this.props.file.products[index].asin}</b>
										</Col>
										<Col span={3}>
											<Form.Item
												name={[index, 'quantity']}
												style={{ marginBottom: 0 }}
												label='Quantity'
												rules={[{ required: true }]}
												labelCol={{ span: 14 }}
												wrapperCol={{ span: 10 }}>
												<InputNumber size='small' onChange={this.getNewQuantity.bind(this)} />
											</Form.Item>
										</Col>
										<Col span={3}>
											<Form.Item
												name={[index, 'price']}
												style={{ marginBottom: 0 }}
												label='Unit Price'
												rules={[{ required: true }]}
												labelCol={{ span: 14 }}
												wrapperCol={{ span: 10 }}>
												<InputNumber size='small' />
											</Form.Item>
										</Col>
										<Col span={3}>
											<Form.Item
												name={[index, 'action']}
												style={{ marginBottom: 0 }}
												label='Action'
												rules={[{ required: true }]}
												labelCol={{ span: 14 }}
												wrapperCol={{ span: 10 }}>
												<Input size='small' />
											</Form.Item>
										</Col>
										<Col span={5}>
											<Form.Item
												name={[index, 'date_1']}
												style={{ marginBottom: 0 }}
												label='Date 1'
												rules={[{ required: true }]}
												labelCol={{ span: 12 }}
												wrapperCol={{ span: 12 }}>
												<DatePicker size='small' />
											</Form.Item>
										</Col>
										<Col span={5}>
											<Form.Item
												name={[index, 'date_2']}
												style={{ marginBottom: 0 }}
												label='Date 2'
												rules={[{ required: true }]}
												labelCol={{ span: 12 }}
												wrapperCol={{ span: 12 }}>
												<DatePicker size='small' />
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
