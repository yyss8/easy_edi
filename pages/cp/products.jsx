import React from 'react';
import Head from 'next/head';
import SiteLayout from "../../components/layout/SiteLayout";
import {Form, Button, Select, Row, message} from 'antd';
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
			isLoading: true,
			isSubmitting: false,
		};
	}

	handleAddressSave(form) {
		this.setState({isSubmitting: true}, () => {

		});
	}

	componentDidMount() {

	}

	formRef = React.createRef();

	render() {
		return <SiteLayout>
			<Head>
				<title>地址管理</title>
			</Head>
			<div>
				<h2>商品管理</h2>
				<Form ref={ this.formRef } onFinish={ this.handleAddressSave.bind(this) }></Form>
			</div>
		</SiteLayout>
	}
}
