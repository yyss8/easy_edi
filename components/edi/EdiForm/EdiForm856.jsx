import React from 'react';
import FormBase from './EdiFormBase';
import {Form, DatePicker, Input, Row, Col, InputNumber, message} from 'antd';
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

		data.delivery_date = data.delivery_date.format('YYYYMMDD');
		data.ship_date = data.ship_date.format('YYYYMMDD');

		axois.post(`/api/generate/edi/856/${this.props.file.name}`, data, {
			responseType: 'arraybuffer',
		})
			.then(response => {
				fileDownload(response.data, `856-${moment().format('MMDD')}-PO-${this.props.file.po_number}.xlsx`);
				message.success('成功生成文件.');
			})
			.catch(rejected => {
				console.log(rejected);
				message.error('生成请求出错, 请稍候再试...');
			});
	}

	getFormItems() {
		return <React.Fragment>
			<Form.Item name="ship_date" label="Ship Date" rules={[{ required: true }]}>
				<DatePicker size="small" />
			</Form.Item>
			<Form.Item name="delivery_date" label="Delivery Date" rules={[{ required: true }]}>
				<DatePicker size="small" />
			</Form.Item>
			<Form.Item name="pro" label="PRO">
				<Input size="small" />
			</Form.Item>
			<Form.Item name="asin" label="ASIN" rules={[{ required: true }]}>
				<Input size="small" />
			</Form.Item>
			<Row>
				<Col offset={ 3 } span={ 9 }>
					<Form.Item name="tracking_number" label="Tracking No" rules={[{ required: true }]}  labelCol={ {span: 8 } } wrapperCol={ {span: 16 } }>
						<Input size="small" />
					</Form.Item>
				</Col>
				<Col span={ 10 }>
					<Form.Item name="sscc" label="SSCC" labelCol={ {span: 6 } } wrapperCol={ {span: 13 } }>
						<Input size="small" />
					</Form.Item>
				</Col>
			</Row>
			<Row>
				<Col offset={ 3 } span={ 9 }>
					<Form.Item initialValue={0} name="stacked_pallets" label="# of Stacked Pallets" labelCol={ {span: 8 } } wrapperCol={ {span: 5 } }>
						<InputNumber size="small" />
					</Form.Item>
				</Col>
				<Col span={ 10 }>
					<Form.Item name="unstacked_pallets" label="# of Unstacked Pallets" rules={[{ required: true }]} labelCol={ {span: 8 } } wrapperCol={ {span: 11 } }>
						<InputNumber size="small" />
					</Form.Item>
				</Col>
			</Row>
			<Form.Item name="to_be_shipped" label="To Be Shipped (EA)" rules={[{ required: true }]}>
				<InputNumber size="small" />
			</Form.Item>
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
						<Input size="small"  />
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
			<Row>
				<Col offset={ 3 } span={ 9 }>
					<Form.Item name="upc" label="UPC" rules={[{ required: true }]} labelCol={ {span: 8 } } wrapperCol={ {span: 16 } }>
						<Input size="small" />
					</Form.Item>
				</Col>
				<Col span={ 10 }>
					<Form.Item initialValue="EA" name="type_unit" label="Unit" rules={[{ required: true }]} labelCol={ {span: 6 } } wrapperCol={ {span: 13 } }>
						<Input size="small" />
					</Form.Item>
				</Col>
			</Row>
		</React.Fragment>
	}
}
