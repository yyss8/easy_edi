import React from 'react';
import FormBase from './EdiFormBase';
import {Form, DatePicker, Input, Row, Col, InputNumber, message, Table, Button, Modal} from 'antd';
import axois from 'axios';
import fileDownload from "js-file-download";
import moment from 'moment';
import axios from "axios";

/**
 * 856文档表单.
 */
export default class extends FormBase {

	/** @inheritdoc */
	constructor(props) {
		super(props);

		this.state = {
			isGenerating: false,
			show753Modal: false,
			file753: [],
			isLoading753: false,
		};
	}

	/** @inheritdoc */
	handleFileGenerate(data) {
		if (!this.props.file) {
			message.error('请选择相关754文件.');
			return;
		}

		this.setState({isGenerating: true}, () => {
			data.delivery_date = data.delivery_date.format('YYYYMMDD');
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

	/**
	 * 加载753归档文档列表.
	 */
	load753Items() {
		this.setState({isLoading753 : true}, () => {
			axios.get('/api/files/archive/753')
				.then(response => {
					const files = response.data.result.files.map((f, k) => ({...f, key: `file-${k}`}));

					this.setState({
						isLoading753: false,
						file753: files,
						show753Modal: true,
					});
				})
				.catch(rejected => {
					message.error('获取文件出错');
					console.log(rejected);
				});
		});
	}

	/**
	 * 处理导入753数据.
	 *
	 * @param {Object} file
	 *   753数据.
	 */
	handle753Import(file) {
		this.getFormRef().current.setFieldsValue({
			ship_date: moment(file.freight_ready_date, 'YYYYMMDD'),
			total_carton: file.total_carton,
			volume: file.volume,
			volume_unit: Boolean(file.volume_unit) ? file.volume_unit.trim() : '',
			weight: file.weight,
			weight_unit: Boolean(file.weight_unit) ? file.weight_unit.trim() : '',
		});
		this.setState({show753Modal: false});
		message.success('753文档信息导入成功');
	}

	/** @inheritdoc */
	getFormItems() {
		const column753 = [
			{
				title: 'PO#',
				key: 'po_number',
				dataIndex: 'po_number',
			},
			{
				title: '文件名',
				key: 'name',
				dataIndex: 'name',
			},
			{
				title: '',
				key: 'actions',
				render: (text, record) => {
					return <span>
						<Button size="small" onClick={() => this.handle753Import(record)}>选择</Button>
					</span>
				}
			}
		];

		return <React.Fragment>
			<Form.Item wrapperCol={{ span: 12, offset: 6 }}>
				<Button size="small" onClick={ this.load753Items.bind(this) } loading={ this.state.isLoading753 }>导入753</Button>
			</Form.Item>
			<Form.Item name="ship_date" label="Ship Date" rules={[{ required: true }]}>
				<DatePicker size="small" />
			</Form.Item>
			<Form.Item name="delivery_date" label="Delivery Date" rules={[{ required: true }]}>
				<DatePicker size="small" />
			</Form.Item>
			<Row>
				<Col offset={ 3 } span={ 9 }>
					<Form.Item name="carrier" label="Carrier" rules={[{ required: true }]} labelCol={ {span: 8 } } wrapperCol={ {span: 16 } }>
						<Input size="small" />
					</Form.Item>
				</Col>
				<Col span={ 10 }>
					<Form.Item name="carrier_code" label="Carrier Code" rules={[{ required: true }]} labelCol={ {span: 6 } } wrapperCol={ {span: 13 } }>
						<Input size="small" />
					</Form.Item>
				</Col>
			</Row>
			<Row>
				<Col offset={ 3 } span={ 9 }>
					<Form.Item name="pro" label="PRO" labelCol={ {span: 8 } } wrapperCol={ {span: 16 } }>
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
					<Form.Item name="total_carton" label="# of Cartons" rules={[{ required: true }]} labelCol={ {span: 8 } } wrapperCol={ {span: 16 } }>
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
					<Form.Item initialValue="EA" name="type_unit" label="Unit" rules={[{ required: true }]} labelCol={ {span: 8 } } wrapperCol={ {span: 16 } }>
						<Input size="small" />
					</Form.Item>
				</Col>
			</Row>
			<Modal visible={this.state.show753Modal} onCancel={ () => this.setState({show753Modal: false}) }>
				<Table dataSource={ this.state.file753 }  columns={ column753 } afterClose={ () => this.setState({ file753: [] }) } />
			</Modal>
		</React.Fragment>
	}
}
