import React from 'react';
import { withRouter } from 'next/router';
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
			fileName: props.query.fileName,
			isLoading: true,
			isLoadingFiles: false,
		};

		this.fetchSingleFile = this.fetchSingleFile.bind(this);
		this.getFileDescription = this.getFileDescription.bind(this);
		this.getCreatingForm = this.getCreatingForm.bind(this);
	}

	componentDidMount() {
		this.fetchSingleFile();
	}

	getCreatingForm() {
		switch (this.state.type) {
			case '753':
				return <EdiForm753 type={this.state.type} file={this.state.file} />;

			case 'label-excel':
				return <EdiFormLabel type={this.state.type} file={ this.state.file } />
		}
	}

	onFetchFiles() {

	}

	handleFileSwitch(file) {
		Modal.confirm({
			title: '是否清空已生成文档?',
		})
	}

	loadSwitchingFiles() {
		this.setState({isLoadingFiles : true}, () => {
			axios.get(`/api/files/850/edi`)
				.then(response => {
					const files = response.data.result.files.map((f, k) => ({...f, key: `file-${k}`}));
					const fileColumns = [
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

					Modal.info({

					});

					this.setState({
						isLoadingFiles: false,
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

				return <Descriptions layout="vertical" title={ <span>订单信息: </span> } bordered>
					<Descriptions.Item span={2} label="PO #">{file.po_number}</Descriptions.Item>
					<Descriptions.Item span={2} label="PO Date">{file.date}</Descriptions.Item>
					<Descriptions.Item span={2} label="Shipping Window">{start} - {end}</Descriptions.Item>
					<Descriptions.Item span={2} label="Ship To">{file.ship_to}</Descriptions.Item>
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

	render() {
		const label = `Excel文档生成 (${this.state.type})`;

		return <SiteLayout>
			<Head>
				<title>{label}</title>
			</Head>
			<Link href="/">
				<a className="ant-btn ant-btn-sm" title="返回主界面" style={ {marginBottom: 20} }>返回</a>
			</Link>
			<h2>Excel文档生成 ({this.state.type})</h2>
			{this.state.file !== null && <Spin spinning={ this.state.isLoading }>
				<Row>
					<Col span={ 8 } offset={ 6 }>
						{ this.getFileDescription() }
					</Col>
				</Row>
			</Spin>}
			{ this.getCreatingForm() }
		</SiteLayout>
	}
}

export default withRouter(EdiFormView);
