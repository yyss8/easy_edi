import React from 'react';
import FormBaseWithAddressLoader from "./FormBaseWithAddressLoader";
import { message } from 'antd';
import axios from 'axios';
import fileDownload from 'js-file-download';
import moment from 'moment';

/**
 * 810文档表单.
 */
export default class extends FormBaseWithAddressLoader {
	constructor(props) {
		super(props);

		this.state = {
			...super.state,
			keyword: '',
		};
	}

	/** @inheritdoc */
	handleFileGenerate(data) {
		if (!this.props.file) {
			message.error('请选择相关855文件.');
			return;
		}

		this.setState({ isGenerating: true }, () => {
			axios
				.post(`/api/generate/edi/810/${this.props.file.name}`, data, {
					responseType: 'arraybuffer',
				})
				.then((response) => {
					fileDownload(response.data, `${this.getFileName(this.props.file)}.xlsx`);
					message.success('成功生成810文件.');
					this.setState({ isGenerating: false });
				})
				.catch((rejected) => {
					console.log(rejected);
					message.error('生成请求出错, 请稍候再试...');
				});
		});
	}

	/** @inheritdoc */
	onDirectSubmit() {
		this.getFormRef()
			.current.validateFields()
			.then(data => this.displayRedirectSubmitConfirm(data))
			.then((data) => {
				this.setState({ isGenerating: true }, () => {
					axios
						.post(`/api/generate/edi/810/${this.props.file.name}?submit=1`, {
							titleOverride: this.state.submittingTitle,
							...data,
						})
						.then((response) => {
							if (response.data.status === 'ok') {
								message.success('成功提交810文件.');
								this.setState({ isGenerating: false, showSubmitConfirm: false });
							} else {
								message.success(`提交810文件出错: ${response.data.errorMessage}`);
								this.setState({ isGenerating: false });
							}
						})
						.catch((rejected) => {
							console.log(rejected);
							message.error('提交请求出错, 请稍候再试...');
						});
				});
			});
	}

	/** @inheritdoc */
	getFileName(file) {
		return `810-${moment().format('MMDD')}-PO-${file.po_number}`;
	}

	/** @inheritdoc */
	getFormItems() {
		return (
			<React.Fragment>
				{this.getShipFromTable()}
				{this.getShipToForm()}
				{super.getFormItems()}
			</React.Fragment>
		);
	}
}
