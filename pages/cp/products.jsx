import React from 'react';
import Head from 'next/head';
import SiteLayout from "../../components/layout/SiteLayout";
import {Form, Button, Row, message} from 'antd';
import axios from 'axios';
import ProductTableForm from "../../components/product/ProductTableForm";

/**
 * 商品管理表单页面.
 */
export default class extends React.Component {
	/** @inheritdoc */
	constructor(props) {
		super(props);

		this.state = {
			isLoading: true,
			isSubmitting: false,
		};
	}

	formRef = React.createRef();

	/** @inheritdoc */
	componentDidMount() {
		this.fetchProducts();
	}

	/**
	 * 处理商品列表表单保存.
	 *
	 * @param {Object} form
	 *   表单数据.
	 */
	handleProductSave(form) {
		this.setState({isSubmitting: true}, () => {
			axios.post('/api/products', {
				products: form.products || [],
			})
				.then(response => {
					this.setState({isSubmitting: false}, () => {
						message.success("商品列表更新成功");
						this.fetchProducts();
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

	/**
	 * 获取并更新表单中的商品列表.
	 */
	fetchProducts() {
		axios.get('/api/products')
			.then(response => {
				this.formRef.current.setFieldsValue({
					products: response.data.result.products || [],
				});
				this.setState({isLoading: false});
			})
			.catch(rejected => {
				console.log(rejected);
				message.error('商品请求出错, 请稍候再试.');
				this.setState({isLoading: false});
			});
	}

	/**
	 * 处理地址列表更新
	 */
	onRefresh() {
		this.setState({isLoading: true}, this.fetchProducts);
	}

	/** @inheritdoc */
	render() {
		return <SiteLayout>
			<Head>
				<title>地址管理</title>
			</Head>
			<div>
				<h2>商品管理</h2>
				<Form ref={ this.formRef } onFinish={ this.handleProductSave.bind(this) }>
					<Form.List name="products">
						{
							(fields, actions) => <div>
								<Row type="flex" justify="space-between" style={ {marginBottom: 10, width: 800} }>
									<div></div>
									<div>
										<Button title="新增地址" onClick={ () => actions.add() } size="small">新增商品</Button>
										&nbsp;&nbsp;
										<Button loading={ this.state.isSubmitting } title="保存商品列表" htmlType="submit" size="small" type="primary">保存商品</Button>
										&nbsp;&nbsp;
										<Button loading={ this.state.isSubmitting } onClick={ this.onRefresh.bind(this) } title="刷新商品列表" size="small">刷新商品</Button>
									</div>
								</Row>
								<ProductTableForm isLoading={ this.state.isLoading } fields={ fields } actions={ actions } formRef={ this.formRef } />
							</div>
						}
					</Form.List>
				</Form>
			</div>
		</SiteLayout>
	}
}
