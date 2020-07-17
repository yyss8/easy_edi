import React from 'react';
import Router, { withRouter } from 'next/router';
import Head from 'next/head';
import { Descriptions, message, Spin, Row, Col, Button, Table, Modal } from 'antd';
import Link from "next/link";
import moment from "moment";
import axios from 'axios';

import SiteLayout from '../../../components/layout/SiteLayout';
import EdiForm753 from "../../../components/edi/EdiForm/EdiForm753";
import EdiFormLabel from "../../../components/edi/EdiForm/EdiFormLabel"
import OrderProductTable from "../../../components/edi/EdiTable/OrderProductTable/OrderProductTable";

class EdiFormView extends React.Component {
	/** @inheritdoc */
	static async getInitialProps({query}) {
		return {
			query,
		};
	}

	constructor(props) {
		super(props);

		this.state = {
			type: props.query.type || '753',
			file: null,
			fileName: props.query.fileName || '',
			isLoading: true,
			isLoadingFiles: false,
			showSwitchModal: false,
			switchingFiles: [],
		};

		this.fetchSingleFile = this.fetchSingleFile.bind(this);
		this.getFileDescription = this.getFileDescription.bind(this);
		this.getCreatingForm = this.getCreatingForm.bind(this);
		this.getSwitchTableColumns = this.getSwitchTableColumns.bind(this);
	}

	componentDidMount() {
		if (Boolean(this.state.fileName)) {
			this.fetchSingleFile();
		}
	}

	getCreatingForm() {
		switch (this.state.type) {
			case '753':
				return <EdiForm753 type={this.state.type} file={this.state.file} />;

			case 'label-excel':
				return <EdiFormLabel type={this.state.type} file={ this.state.file } />
		}
	}

	handleFileSwitch(file) {
		this.setState({file, showSwitchModal: false});
	}

	loadSwitchingFiles(srcType) {
		this.setState({isLoadingFiles : true}, () => {
			axios.get(`/api/files/edi/${srcType}`)
				.then(response => {
					const files = response.data.result.files.map((f, k) => ({...f, key: `file-${k}`}));

					this.setState({
						isLoadingFiles: false,
						switchingFiles: files,
						showSwitchModal: true,
					});
				})
				.catch(rejected => {
					message.error('获取文件出错');
					console.log(rejected);
				});
		});
	}

	getFileDescription() {
		const { type, file } = this.state;

		switch (type) {
			case '753':
				const start = file.shipping_window && file.shipping_window.start !== '' ? moment(file.shipping_window.start, 'YYYYMMDD').format('YYYY/MM/DD') : '无';
				const end = file.shipping_window && file.shipping_window.end !== '' ? moment(file.shipping_window.end, 'YYYYMMDD').format('YYYY/MM/DD') : '无';
				const products = file.products.map((p, i) => ({...p, key: `row-p-${i}`}));

				return <Descriptions layout="vertical" title="订单信息" bordered>
					<Descriptions.Item span={2} label="PO #"><b>{file.po_number}</b></Descriptions.Item>
					<Descriptions.Item span={2} label="PO Date"><b>{file.date}</b></Descriptions.Item>
					<Descriptions.Item span={2} label="Shipping Window"><b>{start} - {end}</b></Descriptions.Item>
					<Descriptions.Item span={2} label="Ship To"><b>{file.ship_to}</b></Descriptions.Item>
					<Descriptions.Item span={ 24 } label="订单商品">
						<OrderProductTable products={ products } withTitle={false} />
					</Descriptions.Item>
				</Descriptions>;
		}
	}

	fetchSingleFile() {
		axios(`/api/file/edi/850/${this.state.fileName}`)
			.then(response => {
				this.setState({file: response.data.result.file, isLoading: false});
			})
			.catch(rejected => {
				message.error('文件请求失败, 请稍候再试');
			});
	}

	onSwitchModalClose() {
		this.setState({switchingFiles: []});
	}

	getSwitchTableColumns() {
		switch (this.state.type) {
			case '753':
				return [
					{
						title: 'PO#',
						key: 'po_number',
						dataIndex: 'po_number',
					},
					{
						title: 'PO日期',
						key: 'po_date',
						render: (text, record) => record.date !== '' ? moment(record.date, 'YYYYMMDD').format('YYYY/MM/DD') : '无',
					},
					{
						title: 'Shipping Window',
						key: 'shipping_window',
						render: (text, {shipping_window}) => {
							const start = shipping_window && shipping_window.start !== '' ? moment(shipping_window.start, 'YYYYMMDD').format('YYYY/MM/DD') : '无';
							const end = shipping_window && shipping_window.end !== '' ? moment(shipping_window.end, 'YYYYMMDD').format('YYYY/MM/DD') : '无';

							return <span>{start} - {end}</span>;
						}
					},
					{
						title: 'Ship To',
						key: 'ship_to',
						dataIndex: 'ship_to',
					},
					{
						title: '',
						key: 'actions',
						render: (text, record) => {
							return <span>
						<Button onClick={() => this.handleFileSwitch(record)}>选择</Button>
					</span>
						}
					}
				];
		}
	}

	render() {
		const label = `Excel文档生成 (${this.state.type})`;

		return <SiteLayout>
			<Head>
				<title>{label}</title>
			</Head>
			<Row type="flex">
				<Link href="/">
					<a className="ant-btn ant-btn-sm" title="返回主界面" style={ {marginBottom: 20} }>返回</a>
				</Link>
				&nbsp;&nbsp;
				{ this.state.type === '753'&& <Button loading={ this.state.isLoadingFiles } onClick={() => this.loadSwitchingFiles('850')} size="small">选择{Boolean(this.state.file) ? '其他' : ''}订单</Button> }
			</Row>

			<h2>Excel文档生成 ({this.state.type})</h2>
			<Row type="flex">
				<Col span={14}>
					{ this.getCreatingForm() }
				</Col>
				{this.state.file !== null && <Col span={ 10 }>
					{ this.getFileDescription() }
				</Col>}
			</Row>

			<Modal width={ 800 } onCancel={ () => this.setState({showSwitchModal: false}) } visible={this.state.showSwitchModal} afterClose={ this.onSwitchModalClose.bind(this) }>
				{ this.state.showSwitchModal && <Table loading={this.state.isLoadingFiles} dataSource={this.state.switchingFiles} columns={this.getSwitchTableColumns()} /> }
			</Modal>
		</SiteLayout>
	}
}

export default withRouter(EdiFormView);
