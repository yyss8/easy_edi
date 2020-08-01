import React, { Component } from 'react';
import Head from 'next/head';
import { Layout, Spin } from 'antd';
import SiteFooter from './footer/SiteFooter';
import SiteHeader from "./header/SiteHeader";
import LoginView from '../login/LoginView';

const { Content } = Layout;

/**
 * 站点全局layout组件.
 */
export default class extends Component {
	user = null;

	/** @inheritdoc */
	constructor(props) {
		super(props);

		this.state = {
			user: null,
			isLoading: true,
		};
	}

	/** @inheritdoc */
	componentDidMount() {
		this.setState({user: localStorage.getItem('user'), isLoading: false});
	}

	/**
	 * 处理当前用户变动.
	 *
	 * @param {string} user
	 *   用户名.
	 */
	userOnchange(user = null) {
		if (user === null) {
			localStorage.removeItem('user');
		} else {
			localStorage.setItem('user', user);
		}

		this.setState({user, isLoading: false});
	}

	/** @inheritdoc */
	render() {
		return <Layout className="layout">
			<Head>
				{ !this.state.user && <title>Easy EDI</title> }
				{/* 防止爬虫以及搜索引擎. */}
				<meta name="robots" content="noindex" />
				<meta name="googlebot" content="noindex" />
			</Head>
			<SiteHeader isLoggedIn={Boolean(this.state.user)} userOnchange={this.userOnchange.bind(this)} />
			<Content className="main-content" id="main">
				<div className="main-content-inner">
					{ this.state.user ? this.props.children : <Spin tip="加载中..." spinning={this.state.isLoading} wrapperClassName="login-view-loading-blur">
						<LoginView userOnchange={this.userOnchange.bind(this)} />
					</Spin> }
				</div>
			</Content>
			<SiteFooter />
		</Layout>;
	}
}
