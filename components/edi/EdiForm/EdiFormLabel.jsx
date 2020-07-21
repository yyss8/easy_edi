import React from 'react';
import FormBase from './EdiFormBase';
import {Form, Input, InputNumber, Row, Col, message, Button} from 'antd';
import { MinusCircleOutlined} from '@ant-design/icons';
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

		if (!data.pallets || data.pallets.length === 0) {
			message.error('至少添加一个Pallet');
			return;
		} else if (data.pallets.length > 10) {
			message.error('当前EDI系统只支持最多10个Pallets');
			return;
		}

		this.setState({isGenerating: true}, () => {
			const { file } = this.props;

			axois.post(`/api/generate/edi/label-excel/${file.name}`, data, {
				responseType: 'arraybuffer',
			})
				.then(response => {
					fileDownload(response.data, `754-label-${moment().format('MMDD')}-PO-${file.po_number}-${file.pallet_num}-${file.pallet_num_to}.xlsx`);
					message.success('成功生成标签文件.');
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
			pallets: [
				{
					pallet_num: 0,
					pallet_num_to: 1,
					package_in_pallet: 1,
				}
			],
		};
	}

	/** @inheritdoc */
	getFormItems() {
		return <React.Fragment>
			<Form.Item name="pro" label="PRO">
				<Input size="small" />
			</Form.Item>
			<Form.Item name="asin" label="ASIN" rules={[{ required: true }]}>
				<Input size="small" />
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
			<Form.Item name="total_pallet" label="Total Pallet" rules={[{ required: true }]}>
				<InputNumber size="small" />
			</Form.Item>
			<Form.List name="pallets">
				{
					(fields, actions) => <div style={ {marginBottom: 20} }>
						<Form.Item wrapperCol={{ span: 12, offset: 6 }}>
							<Button onClick={ () => actions.add() } size="small">Add pallets</Button>
						</Form.Item>
						{
							fields.map((field, index) => {
								return <Row type="flex" align="middle" key={ field.key }>
									<Col offset={ 3 } span={ 6 }>
										<Form.Item style={ {marginBottom: 0} } name={[index, 'pallet_num']} label="Pallet Number" rules={[{ required: true }]} labelCol={ {span: 12 } } wrapperCol={ {span: 10 } }>
											<InputNumber size="small" />
										</Form.Item>
									</Col>
									<Col span={ 5 }>
										<Form.Item name={[index, 'pallet_num_to']} style={ {marginBottom: 0} } label="To" rules={[{ required: true }]} labelCol={ {span: 8 } } wrapperCol={ {span: 10 } }>
											<InputNumber size="small" />
										</Form.Item>
									</Col>
									<Col span={ 5 }>
										<Form.Item name={[index, 'package_in_pallet']} style={ {marginBottom: 0} } label="Packages in Pallet" rules={[{ required: true }]} labelCol={ {span: 14 } } wrapperCol={ {span: 8 } }>
											<InputNumber size="small" />
										</Form.Item>
									</Col>
									<Col span={ 2 }>
										<Button size="small" icon={ <MinusCircleOutlined/> } title="删除" onClick={ () => actions.remove(field.name) } />
									</Col>
								</Row>
							})
						}
					</div>
				}
			</Form.List>
		</React.Fragment>
	}
}
