import React, { Component } from 'react';
import Head from 'next/head';
import { Layout, Spin, Button, Row } from 'antd';
import SiteFooter from './footer/SiteFooter';
import SiteHeader from "./header/SiteHeader";
import LoginView from '../login/LoginView';

const { Content } = Layout;

export default class extends Component {
	user = null;

	constructor(props) {
		super(props);

		this.state = {
			user: null,
			isLoading: true,
		};
	}

	componentDidMount() {
		this.setState({user: localStorage.getItem('user'), isLoading: false});
	}

	userOnchange(user = null) {
		if (user === null) {
			localStorage.removeItem('user');
		} else {
			localStorage.setItem('user', user);
		}

		this.setState({user, isLoading: false});
	}

	render() {
		return <Layout className="layout">
			{ !this.state.user && <Head>
				<title>Easy EDI</title>
			</Head> }
			<SiteHeader isLoggedIn={Boolean(this.state.user)} userOnchange={this.userOnchange.bind(this)} />
			<Content className="main-content" id="main">
				<div className="main-content-inner">
					{ this.state.user ? this.props.children : <Spin tip="加载中..." spinning={this.state.isLoading}>
						<LoginView userOnchange={this.userOnchange.bind(this)} />
					</Spin> }
				</div>
			</Content>
			<SiteFooter />
		</Layout>;
	}
}
