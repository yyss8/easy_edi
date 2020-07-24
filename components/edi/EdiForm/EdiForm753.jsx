import React from 'react';
import FormBase from './EdiFormBase';
import {Form, DatePicker, Input, Row, Col, InputNumber, message, Button, Modal, Table} from 'antd';
import axois from 'axios';
import fileDownload from "js-file-download";
import moment from 'moment';
import qs from 'qs';
import axios from "axios";

/**
 * 753文档表单.
 */
export default class extends FormBase {

	constructor(props) {
		super(props);

		this.state = {
			...super.state,
			isLoadingAddresses: false,
			isAddressModalShown: false,
			loadingType: 'from',
			addresses: [],
			addressKeyword: '',
			keyword: '',
		};

		this.getAddressTable = this.getAddressTable.bind(this);
		this.loadAddress = this.loadAddress.bind(this);
	}

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

	/** @inheritdoc */
	getFormDefaultValues() {
		return {
			weight_unit: 'K',
			volume_unit: 'CI',
		};
	}

	loadAddress() {
		return new Promise((resolve, reject) => {
			const data = {
				type: this.state.loadingType,
			};

			if (Boolean(this.state.keyword)) {
				data.keyword = this.state.keyword;
			}

			axios.get(`/api/addresses?${qs.stringify(data)}`)
				.then(response => {
					resolve( response.data.result.addresses);
				})
				.catch(reject);
		});
	}

	getAddressTable() {
		if (!this.state.isAddressModalShown) {
			return null;
		}

		const addressColumns = [
			{
				title: '描述',
				key: 'address_title',
				dataIndex: 'address_title',
			},
			{
				title: 'Code',
				key: 'address_code',
				dataIndex: 'address_code',
			},
			{
				title: this.state.loadingType === 'from' ? 'Sender' : 'Receiver',
				key: 'owner',
				dataIndex: 'address_owner',
			},
			{
				title: 'Street',
				key: 'address_street',
				dataIndex: 'address_street',
			},
			{
				title: 'City',
				key: 'address_city',
				dataIndex: 'address_city',
			},
			{
				title: 'State',
				key: 'address_state',
				dataIndex: 'address_state',
			},
			{
				title: 'Zip Code',
				key: 'address_zip',
				dataIndex: 'address_zip',
			},
			{
				title: 'Country',
				key: 'address_country',
				dataIndex: 'address_country',
			},
			{
				title: '',
				key: 'action',
				render: (text, record) => <span>
						<Button size="small" title={ `导入${this.state.loadingType === 'from' ? 'Sender' : 'Receiver'}地址` } onClick={ () => this.onImportAddress(record) }>导入</Button>
				</span>
			},
		];

		return <Table dataSource={ this.state.addresses || [] } columns={ addressColumns } />
	}

	onImportAddress(address) {
		const form = this.getFormRef();

		switch (this.state.loadingType) {
			case 'from':
				form.current.setFieldsValue({
					from_code: address.address_code,
					from_street: address.address_street,
					from_city: address.address_city,
					from_state: address.address_state,
					from_zipcode: address.address_zip,
					from_country: address.address_country,
				});
				break;

			case 'to':
				form.current.setFieldsValue({
					ship_to: address.address_code,
					to_street: address.address_street,
					to_city: address.address_city,
					to_state: address.address_state,
					to_zipcode: address.address_zip,
					to_country: address.address_country,
				});
				break;
		}

		this.setState({isAddressModalShown: false});
	}

	onLoadAddress(type) {
		this.setState({loadingType: type, isLoadingAddresses: true}, () => {
			this.loadAddress()
				.then(addresses => {
					this.setState({addresses, isLoadingAddresses: false, isAddressModalShown: true});
				})
				.catch(rejected => {
					this.setState({isLoadingAddresses: false}, () => {
						console.log(rejected);
						message.error('加载地址出错, 请稍候再试');
					});
				});
		});
	}

	/** @inheritdoc */
	getFormItems() {
		return <React.Fragment>
			<Form.Item name="freight_ready_date" label="Freight Ready Date" rules={[{ required: true }]}>
				<DatePicker size="small" />
			</Form.Item>
			<Form.Item label={ <b>Ship From</b> }>
				<Button size="small" onClick={ () => this.onLoadAddress('from') } loading={ this.state.isLoadingAddresses }>导入地址</Button>
			</Form.Item>
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
			<Form.Item label={ <b>Ship To</b> }>
				<Button size="small" onClick={ () => this.onLoadAddress('to') } loading={ this.state.isLoadingAddresses }>导入地址</Button>
			</Form.Item>
			{Boolean(this.props.file) && <Form.Item name="to_code" label="Ship Code">
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
					<Form.Item name="total_carton" label="Total Cartons" rules={[{ required: true }]} labelCol={ {span: 6 } } wrapperCol={ {span: 13 } }>
						<InputNumber size="small" />
					</Form.Item>
				</Col>
			</Row>
			<Row>
				<Col offset={ 3 } span={ 9 }>
					<Form.Item name="weight_unit" label="Weight Unit" rules={[{ required: true }]} labelCol={ {span: 8 } } wrapperCol={ {span: 16 } }>
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
					<Form.Item name="volume_unit" label="Volume Unit" rules={[{ required: true }]} labelCol={ {span: 8 } } wrapperCol={ {span: 16 } }>
						<Input size="small" />
					</Form.Item>
				</Col>
				<Col span={ 10 }>
					<Form.Item name="volume" label="Volume" rules={[{ required: true }]} labelCol={ {span: 6 } } wrapperCol={ {span: 13 } }>
						<InputNumber size="small" />
					</Form.Item>
				</Col>
			</Row>
			<Modal width={ 800 }
						 onCancel={ () => this.setState({isAddressModalShown: false}) }
						 onOk={ () => this.setState({isAddressModalShown: false}) }
						 visible={ this.state.isAddressModalShown } afterClose={ () => this.setState({addresses: [], loadingType: 'from'}) }>
				{ this.getAddressTable() }
			</Modal>
		</React.Fragment>
	}
}
