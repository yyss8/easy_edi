import React from "react";
import {Button, Layout, Row} from "antd";
import HeaderStyles from './SiteHeader.module.scss';

export default props => {
	return <Layout.Header className={ HeaderStyles.header }>
		<Row type="flex" justify="space-between" align="middle">
			<h1 style={{color: '#CDD2D4', marginBottom: 0}}>Easy EDI</h1>
			{ props.isLoggedIn && <Button title="注销账户" size="small" onClick={() => props.userOnchange(null) }>注销</Button> }
		</Row>
	</Layout.Header>;
}
