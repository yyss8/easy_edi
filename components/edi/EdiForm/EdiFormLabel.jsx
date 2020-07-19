import React from 'react';
import FormBase from './EdiFormBase';
import {Form, Input, InputNumber, Row, Col, message} from 'antd';
import axois from "axios";
import fileDownload from "js-file-download";
import moment from "moment";

/**
 * 标签文档表单
 */
export default class extends FormBase {
	/** @inheritdoc */
	handleFileGenerate(data) {
		if (!this.props.file) {
			message.error('请选择相关754文件.');
			return;
		}

		const { file } = this.props;

		axois.post(`/api/generate/edi/label-excel/${file.name}`, data, {
			responseType: 'arraybuffer',
		})
			.then(response => {
				fileDownload(response.data, `754-label-${moment().format('MMDD')}-PO-${file.po_number}-${file.pallet_num}-${file.pallet_num_to}.xlsx`);
				message.success('成功生成标签文件.');
			})
			.catch(rejected => {
				console.log(rejected);
				message.error('生成请求出错, 请稍候再试...');
			});
	}

	getFormItems() {
		return <React.Fragment>
			<Form.Item name="pro" label="PRO">
				<Input size="small" />
			</Form.Item>
			<Form.Item name="asin" label="ASIN" rules={[{ required: true }]}>
				<Input size="small" />
			</Form.Item>
			<Form.Item name="total_pallet" label="Total Pallet" rules={[{ required: true }]}>
				<InputNumber size="small" />
			</Form.Item>
			<Row>
				<Col offset={ 3 } span={ 6 }>
					<Form.Item initialValue={ 1 } name="pallet_num" label="Pallet Number" rules={[{ required: true }]} labelCol={ {span: 12 } } wrapperCol={ {span: 8 } }>
						<InputNumber size="small" />
					</Form.Item>
				</Col>
				<Col span={ 6 }>
					<Form.Item name="pallet_num_to" label="To" rules={[{ required: true }]} labelCol={ {span: 4 } } wrapperCol={ {span: 8 } }>
						<InputNumber size="small" />
					</Form.Item>
				</Col>
			</Row>
			<Form.Item name="package_in_pallet" label="Packages in Pallet" rules={[{ required: true }]}>
				<InputNumber size="small" />
			</Form.Item>
		</React.Fragment>
	}
}
