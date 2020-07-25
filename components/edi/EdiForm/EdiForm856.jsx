import React from 'react';
import FormBase from './EdiFormBase';
import {Form, DatePicker, Input, Row, Col, InputNumber, message, Button} from 'antd';
import axois from 'axios';
import fileDownload from "js-file-download";
import moment from 'moment';

/**
 * 856文档表单.
 */
export default class extends FormBase {

	/** @inheritdoc */
	handleFileGenerate(data) {
		if (!this.props.file) {
			message.error('请选择相关754文件.');
			return;
		}

		this.setState({isGenerating: true}, () => {
			data.ship_date = data.ship_date.format('YYYYMMDD');

			axois.post(`/api/generate/edi/856/${this.props.file.name}`, data, {
				responseType: 'arraybuffer',
			})
				.then(response => {
					fileDownload(response.data, `856-${moment().format('MMDD')}-PO-${this.props.file.po_number}.xlsx`);
					message.success('成功生成856文件.');
					this.setState({isGenerating: false});
				})
				.catch(rejected => {
					console.log(rejected);
					message.error('生成请求出错, 请稍候再试...');
				});
		})
	}

	/** @inheritdoc */
	getFormItems() {
		const twoColumnLayout = this.getTwoColumnSpans();

		return <React.Fragment>
			<Form.Item name="ship_date" label="Ship/Delivery Date" rules={[{ required: true }]}>
				<DatePicker size="small" />
			</Form.Item>
			<Row>
				<Col{...twoColumnLayout.first.outer}>
					<Form.Item name="carrier" label="Carrier" rules={[{ required: true }]}{...twoColumnLayout.first.inner}>
						<Input size="small" />
					</Form.Item>
				</Col>
				<Col{...twoColumnLayout.second.outer}>
					<Form.Item name="carrier_code" label="Carrier Code" rules={[{ required: true }]}{...twoColumnLayout.second.inner}>
						<Input size="small" />
					</Form.Item>
				</Col>
			</Row>
			<Row>
				<Col{...twoColumnLayout.first.outer}>
					<Form.Item name="pro" label="PRO"{...twoColumnLayout.first.inner}>
						<Input size="small" />
					</Form.Item>
				</Col>
			</Row>
			<Row>
				<Col{...twoColumnLayout.first.outer}>
					<Form.Item initialValue={0} name="stacked_pallets" label="Total Stacked Pallets"{...twoColumnLayout.first.inner}>
						<InputNumber size="small" />
					</Form.Item>
				</Col>
				<Col{...twoColumnLayout.second.outer}>
					<Form.Item name="unstacked_pallets" label="Total Unstacked Pallets" rules={[{ required: true }]}{...twoColumnLayout.second.inner}>
						<InputNumber size="small" />
					</Form.Item>
				</Col>
			</Row>
			<Row>
				<Col{...twoColumnLayout.first.outer}>
					<Form.Item name="to_be_shipped" label="To Be Shipped (EA)" rules={[{ required: true }]} {...twoColumnLayout.second.inner}>
						<InputNumber size="small" />
					</Form.Item>
				</Col>
			</Row>
			<Row>
				<Col{...twoColumnLayout.first.outer}>
					<Form.Item name="total_pallet" label="Total Number of Pallets" rules={[{ required: true }]}{...twoColumnLayout.first.inner}>
						<InputNumber size="small" />
					</Form.Item>
				</Col>
				<Col{...twoColumnLayout.second.outer}>
					<Form.Item name="total_carton" label="Total Number of Cartons" rules={[{ required: true }]}{...twoColumnLayout.second.inner}>
						<InputNumber size="small" />
					</Form.Item>
				</Col>
			</Row>
			<Row>
				<Col{...twoColumnLayout.first.outer}>
					<Form.Item name="weight_unit" label="Weight Unit" rules={[{ required: true }]}{...twoColumnLayout.first.inner}>
						<Input size="small" />
					</Form.Item>
				</Col>
				<Col{...twoColumnLayout.second.outer}>
					<Form.Item name="weight" label="Weight" rules={[{ required: true }]}{...twoColumnLayout.second.inner}>
						<Input size="small" />
					</Form.Item>
				</Col>
			</Row>

			<Row>
				<Col{...twoColumnLayout.first.outer}>
					<Form.Item name="volume_unit" label="Volume Unit" rules={[{ required: true }]}{...twoColumnLayout.first.inner}>
						<Input size="small" />
					</Form.Item>
				</Col>
				<Col{...twoColumnLayout.second.outer}>
					<Form.Item name="volume" label="Volume" rules={[{ required: true }]}{...twoColumnLayout.second.inner}>
						<InputNumber size="small" />
					</Form.Item>
				</Col>
			</Row>
			<Row>
				<Col{...twoColumnLayout.first.outer}>
					<Form.Item initialValue="EA" name="type_unit" label="Unit" rules={[{ required: true }]}{...twoColumnLayout.first.inner}>
						<Input size="small" />
					</Form.Item>
				</Col>
			</Row>
		</React.Fragment>
	}
}
