import React, { Component } from 'react';
import { Layout } from 'antd';
import SiteFooter from './footer/SiteFooter';

const { Content } = Layout;

export default class extends Component {
	render() {
		return <Layout className="layout">
			<Content className="main-content" id="main">
				<div className="main-content-inner">
					{this.props.children}
				</div>
			</Content>
			<SiteFooter />
		</Layout>;
	}
}
