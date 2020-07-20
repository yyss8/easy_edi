import React from 'react';
import FormBase from './EdiFormBase';
import {Form, DatePicker, Input, Row, Col, InputNumber, message} from 'antd';
import axois from 'axios';
import fileDownload from "js-file-download";
import moment from 'moment';

/**
 * 753文档表单.
 */
export default class extends FormBase {

	/** @inheritdoc */
	handleFileGenerate(data) {
		if (!this.props.file) {
			message.error('请选择相关850文件.');
			return;
		}

		this.setState({isGenerating: true}, () => {
			data.freight_ready_date = data.freight_ready_date.format('YYYYMMDD');

			axois.post(`/api/generate/edi/753/${this.props.file.name}`, data, {
				responseType: 'arraybuffer',
			})
				.then(response => {
					fileDownload(response.data, `753-${moment().format('MMDD')}-PO-${this.props.file.po_number}.xlsx`);
					message.success('成功生成753文件.');
					this.setState({isGenerating: false});
				})
				.catch(rejected => {
					console.log(rejected);
					message.error('生成请求出错, 请稍候再试...');
				});
		});
	}

	getFormItems() {
		return <React.Fragment>
			<Form.Item name="freight_ready_date" label="Freight Ready Date" rules={[{ required: true }]}>
				<DatePicker size="small" />
			</Form.Item>
			<Form.Item label={ <b>Ship From</b> } rules={[{ required: true }]} />
			<Form.Item name="from_code" label="Ship Code" rules={[{ required: true }]}>
				<Input size="small" />
			</Form.Item>
			<Form.Item name="from_street" label="Street" rules={[{ required: true }]}>
				<Input size="small" />
			</Form.Item>
			<Row>
				<Col offset={ 3 } span={ 9 }>
					<Form.Item name="from_city" label="City" rules={[{ required: true }]} labelCol={ {span: 8 } } wrapperCol={ {span: 16 } } >
						<Input size="small" />
					</Form.Item>
				</Col>
				<Col span={ 10 }>
					<Form.Item name="from_state" label="State/Province" rules={[{ required: true }]} labelCol={ {span: 6 } } wrapperCol={ {span: 13 } }>
						<Input size="small" />
					</Form.Item>
				</Col>
			</Row>
			<Row>
				<Col offset={ 3 } span={ 9 }>
					<Form.Item name="from_zipcode" label="Zip Code" rules={[{ required: true }]} labelCol={ {span: 8 } } wrapperCol={ {span: 16 } }>
						<Input size="small" />
					</Form.Item>
				</Col>
				<Col span={ 10 }>
					<Form.Item name="from_country" label="Country" rules={[{ required: true }]} labelCol={ {span: 6 } } wrapperCol={ {span: 13 } }>
						<Input size="small" />
					</Form.Item>
				</Col>
			</Row>
			<Form.Item label={ <b>Ship To</b> } rules={[{ required: true }]} />
			{Boolean(this.props.file) && <Form.Item name="from_code" label="Ship Code" rules={[{ required: true }]}>
				<span>{this.props.file.ship_to}</span>
			</Form.Item>}
			<Form.Item name="to_street" label="Street" rules={[{ required: true }]}>
				<Input size="small" />
			</Form.Item>
			<Row>
				<Col offset={ 3 } span={ 9 }>
					<Form.Item name="to_city" label="City" rules={[{ required: true }]} labelCol={ {span: 8 } } wrapperCol={ {span: 16 } } >
						<Input size="small" />
					</Form.Item>
				</Col>
				<Col span={ 10 }>
					<Form.Item name="to_state" label="State/Province" rules={[{ required: true }]} labelCol={ {span: 6 } } wrapperCol={ {span: 13 } }>
						<Input size="small" />
					</Form.Item>
				</Col>
			</Row>
			<Row>
				<Col offset={ 3 } span={ 9 }>
					<Form.Item name="to_zipcode" label="Zip Code" rules={[{ required: true }]} labelCol={ {span: 8 } } wrapperCol={ {span: 16 } }>
						<Input size="small" />
					</Form.Item>
				</Col>
				<Col span={ 10 }>
					<Form.Item name="to_country" label="Country" rules={[{ required: true }]} labelCol={ {span: 6 } } wrapperCol={ {span: 13 } }>
						<Input size="small" />
					</Form.Item>
				</Col>
			</Row>
			<Row>
				<Col offset={ 3 } span={ 9 }>
					<Form.Item name="total_pallet" label="# of Packages" rules={[{ required: true }]} labelCol={ {span: 8 } } wrapperCol={ {span: 16 } }>
						<InputNumber size="small" />
					</Form.Item>
				</Col>
				<Col span={ 10 }>
					<Form.Item name="total_carton" label="# of Cartons" rules={[{ required: true }]} labelCol={ {span: 6 } } wrapperCol={ {span: 13 } }>
						<InputNumber size="small" />
					</Form.Item>
				</Col>
			</Row>
			<Row>
				<Col offset={ 3 } span={ 9 }>
					<Form.Item initialValue="K" name="weight_unit" label="Weight Unit" rules={[{ required: true }]} labelCol={ {span: 8 } } wrapperCol={ {span: 16 } }>
						<Input size="small" />
					</Form.Item>
				</Col>
				<Col span={ 10 }>
					<Form.Item name="weight" label="Weight" rules={[{ required: true }]} labelCol={ {span: 6 } } wrapperCol={ {span: 13 } }>
						<Input size="small" />
					</Form.Item>
				</Col>
			</Row>

			<Row>
				<Col offset={ 3 } span={ 9 }>
					<Form.Item initialValue="E" name="volume_unit" label="Volume Unit" rules={[{ required: true }]} labelCol={ {span: 8 } } wrapperCol={ {span: 16 } }>
						<Input size="small" />
					</Form.Item>
				</Col>
				<Col span={ 10 }>
					<Form.Item name="volume" label="Volume" rules={[{ required: true }]} labelCol={ {span: 6 } } wrapperCol={ {span: 13 } }>
						<InputNumber size="small" />
					</Form.Item>
				</Col>
			</Row>
		</React.Fragment>
	}
}
