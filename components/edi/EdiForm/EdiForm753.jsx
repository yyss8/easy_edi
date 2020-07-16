import React from 'react';
import FormBase from './EdiFormBase';
import {Form, DatePicker, Input, Row, Col, InputNumber, message} from 'antd';
import axois from 'axios';
import fileDownload from "js-file-download";
import moment from 'moment';

export default class extends FormBase {

	handleFileGenerate(data) {
		data.freight_ready_date = data.freight_ready_date.format('YYYYMMDD');

		axois.post(`/api/generate/edi/753/${this.props.file.name}`, data, {
			responseType: 'arraybuffer',
		})
			.then(response => {
				fileDownload(response.data, `753-${moment().format('MMDD')}-PO-${this.props.file.po_number}.xlsx`);
				message.success('成功生成文件.');
			})
			.catch(rejected => {
				console.log(rejected);
				message.error('生成请求出错, 请稍候再试...');
			});
	}

	getFormItems() {
		return <React.Fragment>
			<Form.Item name="freight_ready_date" label="Freight Ready Date" rules={[{ required: true }]}>
				<DatePicker placeholder="选择日期" />
			</Form.Item>
			<Form.Item name="from_code" label="发货地址编号" rules={[{ required: true }]}>
				<Input placeholder="输入发货地址编号" />
			</Form.Item>
			<Form.Item name="from_street" label="发货街道" rules={[{ required: true }]}>
				<Input placeholder="输入发货街道" />
			</Form.Item>
			<Row>
				<Col offset={ 3 } span={ 6 }>
					<Form.Item name="from_city" label="发货城市" rules={[{ required: true }]} labelCol={ {span: 12 } } wrapperCol={ {span: 12 } } >
						<Input placeholder="输入发货城市" />
					</Form.Item>
				</Col>
				<Col span={ 5 }>
					<Form.Item name="from_state" label="发货州/省" rules={[{ required: true }]} labelCol={ {span: 12 } } wrapperCol={ {span: 12} }>
						<Input placeholder="输入发货州/省" />
					</Form.Item>
				</Col>
			</Row>
			<Row>
				<Col offset={ 3 } span={ 6 }>
					<Form.Item name="from_zipcode" label="发货邮编" rules={[{ required: true }]} labelCol={ {span: 12 } } wrapperCol={ {span: 12 } }>
						<Input placeholder="输入发货邮编" />
					</Form.Item>
				</Col>
				<Col span={ 5 }>
					<Form.Item name="from_country" label="发货国家" rules={[{ required: true }]} labelCol={ {span: 12 } } wrapperCol={ {span: 12 } }>
						<Input placeholder="输入发货国家" />
					</Form.Item>
				</Col>
			</Row>
			<Form.Item name="to_street" label="收货街道" rules={[{ required: true }]}>
				<Input placeholder="输入收货街道" />
			</Form.Item>
			<Row>
				<Col offset={ 3 } span={ 6 }>
					<Form.Item name="to_city" label="收货城市" rules={[{ required: true }]} labelCol={ {span: 12 } } wrapperCol={ {span: 12 } } >
						<Input placeholder="输入收货城市" />
					</Form.Item>
				</Col>
				<Col span={ 5 }>
					<Form.Item name="to_state" label="收货州/省" rules={[{ required: true }]} labelCol={ {span: 12 } } wrapperCol={ {span: 12} }>
						<Input placeholder="输入收货州/省" />
					</Form.Item>
				</Col>
			</Row>
			<Row>
				<Col offset={ 3 } span={ 6 }>
					<Form.Item name="to_zipcode" label="收货邮编" rules={[{ required: true }]} labelCol={ {span: 12 } } wrapperCol={ {span: 12 } }>
						<Input placeholder="输入收货邮编" />
					</Form.Item>
				</Col>
				<Col span={ 5 }>
					<Form.Item name="to_country" label="收货国家" rules={[{ required: true }]} labelCol={ {span: 12 } } wrapperCol={ {span: 12 } }>
						<Input placeholder="输入收货国家" />
					</Form.Item>
				</Col>
			</Row>
			<Form.Item name="total_pallet" label="托盘总数" rules={[{ required: true }]}>
				<InputNumber placeholder="输入托盘总数" />
			</Form.Item>
			<Form.Item name="total_carton" label="箱数" rules={[{ required: true }]}>
				<InputNumber placeholder="输入箱数" />
			</Form.Item>
			<Form.Item name="weight_unit" label="重量单位" rules={[{ required: true }]}>
				<Input placeholder="输入重量单位" />
			</Form.Item>
			<Form.Item name="weight" label="重量" rules={[{ required: true }]}>
				<Input placeholder="输入重量" />
			</Form.Item>
			<Form.Item name="volume_unit" label="体积单位" rules={[{ required: true }]}>
				<Input placeholder="输入体积单位" />
			</Form.Item>
			<Form.Item name="volume" label="体积" rules={[{ required: true }]}>
				<InputNumber placeholder="输入体积" />
			</Form.Item>
		</React.Fragment>
	}
}
