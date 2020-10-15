import React from 'react';
import FormBase from './EdiFormBase';
import {Input, Row, Col, message, Button, Modal, Table, Form} from 'antd';
import qs from 'qs';
import axios from 'axios';

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

	loadAddress() {
		return new Promise((resolve, reject) => {
			const data = {
				type: this.state.loadingType,
			};

			if (Boolean(this.state.keyword)) {
				data.keyword = this.state.keyword;
			}

			axios
				.get(`/api/addresses?${qs.stringify(data)}`)
				.then((response) => {
					resolve(response.data.result.addresses);
				})
				.catch(reject);
		});
	}

	/**
	 * 获取地址表格.
	 *
	 * @return {null|React}
	 *   地址表格元素.
	 */
	getAddressTable() {
		if (!this.state.isAddressModalShown) {
			return null;
		}

		const addressColumns = [
			{
				title: 'Description',
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
				render: (text, record) => (
					<span>
            <Button
							size='small'
							title={`导入${this.state.loadingType === 'from' ? 'Sender' : 'Receiver'}地址`}
							onClick={() => this.onImportAddress(record)}>
              导入
            </Button>
          </span>
				),
			},
		];

		return (
			<div>
				<Row type='flex' style={{ marginBottom: 10 }}>
					<Col span={4}>
						<Input.Search
							placeholder='搜索地址'
							value={this.state.keyword}
							onChange={(e) => this.setState({ keyword: e.target.value })}
							size='small'
							onSearch={() => this.onLoadAddress(this.state.loadingType)}
						/>
					</Col>
				</Row>
				<Table dataSource={this.state.addresses || []} columns={addressColumns} />
			</div>
		);
	}

	/**
	 * 处理加载地址列表.
	 *
	 * @param {string} type
	 *   地址类型.
	 */
	onLoadAddress(type) {
		this.setState({ loadingType: type, isLoadingAddresses: true }, () => {
			this.loadAddress()
				.then((addresses) => {
					this.setState({ addresses, isLoadingAddresses: false, isAddressModalShown: true });
				})
				.catch((rejected) => {
					this.setState({ isLoadingAddresses: false }, () => {
						console.log(rejected);
						message.error('加载地址出错, 请稍候再试');
					});
				});
		});
	}

	/**
	 * 处理导入地址至表单.
	 *
	 * @param {Object} address
	 *   地址数据.
	 */
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

		this.setState({ isAddressModalShown: false });
	}

	getShipFromTable() {
		const twoColumnLayout = this.getTwoColumnSpans();

		return <React.Fragment>
			<Form.Item label={<b>Ship From</b>}>
				<Button size='small' onClick={() => this.onLoadAddress('from')} loading={this.state.isLoadingAddresses}>
					导入地址
				</Button>
			</Form.Item>
			<Form.Item name='from_code' label='Address Number' rules={[{ required: true }]}>
				<Input size='small' />
			</Form.Item>
			<Form.Item name='from_street' label='Street' rules={[{ required: true }]}>
				<Input size='small' />
			</Form.Item>
			<Row>
				<Col {...twoColumnLayout.first.outer}>
					<Form.Item name='from_city' label='City' rules={[{ required: true }]} {...twoColumnLayout.first.inner}>
						<Input size='small' />
					</Form.Item>
				</Col>
				<Col {...twoColumnLayout.second.outer}>
					<Form.Item
						name='from_state'
						label='State/Province'
						rules={[{ required: true }]}
						{...twoColumnLayout.second.inner}>
						<Input size='small' />
					</Form.Item>
				</Col>
			</Row>
			<Row>
				<Col {...twoColumnLayout.first.outer}>
					<Form.Item
						name='from_zipcode'
						label='Zip Code'
						rules={[{ required: true }]}
						{...twoColumnLayout.first.inner}>
						<Input size='small' />
					</Form.Item>
				</Col>
				<Col {...twoColumnLayout.second.outer}>
					<Form.Item
						name='from_country'
						label='Country'
						rules={[{ required: true }]}
						{...twoColumnLayout.second.inner}>
						<Input size='small' />
					</Form.Item>
				</Col>
			</Row>
		</React.Fragment>
	}

	getShipToForm() {
		const twoColumnLayout = this.getTwoColumnSpans();

		return <React.Fragment>
			<Form.Item label={<b>Ship To</b>}>
				<Button size='small' onClick={() => this.onLoadAddress('to')} loading={this.state.isLoadingAddresses}>
					导入地址
				</Button>
			</Form.Item>
			{Boolean(this.props.file) && (
				<Form.Item name='to_code' label='Ship Code'>
					<span>{this.props.file.ship_to}</span>
				</Form.Item>
			)}
			<Form.Item name='to_street' label='Street' rules={[{ required: true }]}>
				<Input size='small' />
			</Form.Item>
			<Row>
				<Col {...twoColumnLayout.first.outer}>
					<Form.Item name='to_city' label='City' rules={[{ required: true }]} {...twoColumnLayout.first.inner}>
						<Input size='small' />
					</Form.Item>
				</Col>
				<Col {...twoColumnLayout.second.outer}>
					<Form.Item
						name='to_state'
						label='State/Province'
						rules={[{ required: true }]}
						{...twoColumnLayout.second.inner}>
						<Input size='small' />
					</Form.Item>
				</Col>
			</Row>
			<Row>
				<Col {...twoColumnLayout.first.outer}>
					<Form.Item name='to_zipcode' label='Zip Code' rules={[{ required: true }]} {...twoColumnLayout.first.inner}>
						<Input size='small' />
					</Form.Item>
				</Col>
				<Col {...twoColumnLayout.second.outer}>
					<Form.Item name='to_country' label='Country' rules={[{ required: true }]} {...twoColumnLayout.second.inner}>
						<Input size='small' />
					</Form.Item>
				</Col>
			</Row>
		</React.Fragment>
	}

	getFormItems() {
		return <Modal
			width={1000}
			onCancel={() => this.setState({ isAddressModalShown: false })}
			onOk={() => this.setState({ isAddressModalShown: false })}
			visible={this.state.isAddressModalShown}
			afterClose={() => this.setState({ addresses: [], loadingType: 'from', keyword: '' })}>
			{this.getAddressTable()}
		</Modal>;
	}

}
