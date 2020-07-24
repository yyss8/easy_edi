import React from 'react';
import Head from 'next/head';
import Router from 'next/router';
import SiteLayout from "../../components/layout/SiteLayout";
import {Form, Button, Select, Row, message} from 'antd';
import AddressTableForm from "../../components/address/AddressTableForm";
import axios from 'axios';

export default class extends React.Component {
	/** @inheritdoc */
	static async getInitialProps({query}) {
		return {
			query,
		};
	}

	constructor(props) {
		super(props);

		const { query } = props;

		this.state = {
			type: query.type || 'from',
			isLoading: true,
			isSubmitting: false,
		};
	}

	handleAddressSave(form) {
		this.setState({isSubmitting: true}, () => {
			const addresses = form.address.map(address => {
				return {
					address_type: this.state.type,
					...address,
				};
			});

			axios.post('/api/addresses', {
				addresses,
				type: this.state.type,
			})
				.then(response => {
					this.setState({isSubmitting: false}, () => {
						message.success("地址列表更新成功");
						this.fetchAddresses();
					});
				})
				.catch(rejected => {
					this.setState({isSubmitting: false}, () => {
						console.log(rejected);
						message.error('更新请求出错, 请稍候再试...');
					});
				});
		});
	}

	componentDidMount() {
		this.fetchAddresses();
	}

	filterOnChange(value, field) {
		this.setState({[field]: value, isLoading: true}, () => {
			this.fetchAddresses();
			Router.push({
				pathname: '/cp/addresses',
				query: this.buildQuery(),
			});
		});
	}

	fetchAddresses() {
		axios.get(`/api/addresses?type=${this.state.type}`)
			.then(response => {
				this.formRef.current.setFieldsValue({
					address: response.data.result.addresses || [],
				});
				this.setState({isLoading: false});
			})
			.catch(rejected => {
				console.log(rejected);
				message.error('地址请求出错, 请稍候再试.');
				this.setState({isLoading: false});
			});
	}

	buildQuery() {
		const query = {};

		if (this.state.type !== 'from') {
			query.type = this.state.type;
		}

		return query;
	}

	onRefresh() {
		this.setState({isLoading: true}, this.fetchAddresses);
	}

	formRef = React.createRef();

	render() {
		return <SiteLayout>
			<Head>
				<title>地址管理</title>
			</Head>
			<div>
				<h2>地址管理</h2>
				<Form ref={ this.formRef } onFinish={ this.handleAddressSave.bind(this) }>
					<Form.List name="address">
						{
							(fields, actions) => <div>
								<Row type="flex" justify="space-between" style={ {marginBottom: 10} }>
									<Select style={ {minWidth: 100} } title="选择地址类型" size="small" value={ this.state.type } onChange={ value => this.filterOnChange(value, 'type') }>
										<Select.Option value="from">Ship From</Select.Option>
										<Select.Option value="to">Ship To</Select.Option>
									</Select>
									<div>
										<Button title="新增地址" onClick={ () => actions.add() } size="small">新增地址</Button>
										&nbsp;&nbsp;
										<Button loading={ this.state.isSubmitting } title="保存当前地址" htmlType="submit" size="small" type="primary">保存地址</Button>
										&nbsp;&nbsp;
										<Button loading={ this.state.isSubmitting } onClick={ this.onRefresh.bind(this) } title="刷新地址列表" size="small">刷新地址</Button>
									</div>
								</Row>
								<AddressTableForm isLoading={ this.state.isLoading } type={ this.state.type } fields={ fields } actions={ actions } />
							</div>
						}
					</Form.List>
				</Form>
			</div>
		</SiteLayout>
	}
}
