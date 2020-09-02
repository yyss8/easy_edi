import React from 'react';
import Router, { withRouter } from 'next/router';
import Head from 'next/head';
import { Descriptions, message, Row, Col, Button, Table, Modal, Spin } from 'antd';
import moment from 'moment';
import axios from 'axios';

import SiteLayout from '../../../components/layout/SiteLayout';
import EdiForm753 from '../../../components/edi/EdiForm/EdiForm753';
import EdiFormLabel from '../../../components/edi/EdiForm/EdiFormLabel';
import OrderProductTable from '../../../components/edi/EdiTable/OrderProductTable/OrderProductTable';
import EdiDetails754 from '../../../components/edi/EdiDetails/EdiDetails754';
import EdiForm856 from '../../../components/edi/EdiForm/EdiForm856';
import EdiDetailsLabel from '../../../components/edi/EdiDetails/EdiDetailsLabel';

const VOLUME_MAP = {
  E: 'ECF',
  N: 'CI',
  X: 'CR',
};

const WEIGHT_MAP = {
  G: 'GR',
  K: 'KG',
  L: 'LB',
  O: 'OZ',
};

/**
 * EDI表单通用页面.
 */
class EdiFormView extends React.Component {
  formRef = React.createRef();

  /** @inheritdoc */
  static async getInitialProps({ query }) {
    return {
      query,
    };
  }

  /** @inheritdoc */
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

  /** @inheritdoc */
  componentDidMount() {
    if (Boolean(this.state.fileName)) {
      this.fetchSingleFile();
    }
  }

  /**
   * 获取生成中文档表单.
   *
   * @return {React}
   */
  getCreatingForm() {
    switch (this.state.type) {
      case '753':
        return <EdiForm753 type={this.state.type} file={this.state.file} parentRef={this.formRef} />;

      case '856':
        return <EdiForm856 type={this.state.type} file={this.state.file} parentRef={this.formRef} />;

      case 'label-excel':
        return <EdiFormLabel type={this.state.type} file={this.state.file} parentRef={this.formRef} />;
    }
  }

  /**
   * 处理文档替换.
   *
   * @param {Object} file
   *   要替换的文档数据.
   */
  handleFileSwitch(file) {
    if (this.state.type === '856') {
      this.formRef.current.setFieldsValue({
        carrier: Boolean(file.carrier) ? file.carrier.trim() : '',
        carrier_code: Boolean(file.carrier_code) ? file.carrier_code.trim() : '',
        pro: Boolean(file.pro) ? file.pro.trim() : '',
      });
    } else if (this.state.type === 'label-excel') {
      this.formRef.current.setFieldsValue({
        carrier: Boolean(file.carrier) ? file.carrier.trim() : '',
        carrier_code: Boolean(file.carrier_code) ? file.carrier_code.trim() : '',
      });
    }

    this.setState({ file, showSwitchModal: false });
  }

  /**
   * 获取生成中文档列表.
   *
   * @param {string} srcType
   *   文档类型.
   * @param {string} dirType
   *   文档目录类型.
   */
  loadSwitchingFiles(srcType, dirType = 'edi') {
    this.setState({ isLoadingFiles: true }, () => {
      axios
        .get(`/api/files/${dirType}/${srcType}`)
        .then((response) => {
          const files = response.data.result.files.map((f, k) => ({ ...f, key: `file-${k}` }));

          this.setState({
            isLoadingFiles: false,
            switchingFiles: files,
            showSwitchModal: true,
          });
        })
        .catch((rejected) => {
          message.error('获取文件出错');
          console.log(rejected);
        });
    });
  }

  /**
   * 获取生产中文档描述
   *
   * @return {Descriptions}
   */
  getFileDescription() {
    const { type, file } = this.state;

    switch (type) {
      case '753':
        const start =
          file.shipping_window && file.shipping_window.start !== ''
            ? moment(file.shipping_window.start, 'YYYYMMDD').format('YYYY/MM/DD')
            : '无';
        const end =
          file.shipping_window && file.shipping_window.end !== ''
            ? moment(file.shipping_window.end, 'YYYYMMDD').format('YYYY/MM/DD')
            : '无';
        const products = file.products.map((p, i) => ({ ...p, key: `row-p-${i}` }));

        return (
          <Descriptions size='middle' layout='vertical' title='订单信息' bordered>
            <Descriptions.Item span={2} label='PO #'>
              <b>{file.po_number}</b>
            </Descriptions.Item>
            <Descriptions.Item span={2} label='PO Date'>
              <b>{moment(file.date, 'YYYYMMDD').format('YYYY-MM-DD')}</b>
            </Descriptions.Item>
            <Descriptions.Item span={2} label='Shipping Window'>
              <b>
                {start} - {end}
              </b>
            </Descriptions.Item>
            <Descriptions.Item span={2} label='Ship To'>
              <b>{file.ship_to}</b>
            </Descriptions.Item>
            <Descriptions.Item span={1} label='Freight Class'>
              50
            </Descriptions.Item>
            <Descriptions.Item span={1} label='Packaging Form Code'>
              PLT
            </Descriptions.Item>
            <Descriptions.Item span={1} label='Stackable'>
              N
            </Descriptions.Item>
            <Descriptions.Item span={3} label='Order Products'>
              <OrderProductTable products={products} withTitle={false} />
            </Descriptions.Item>
          </Descriptions>
        );

      case 'label-excel':
        return <EdiDetails754 file={this.state.file} />;

      case '856':
        return <EdiDetailsLabel file={this.state.file} />;
    }
  }

  /**
   * 获取生产中文档.
   */
  fetchSingleFile() {
    const typeMapper = {
      '753': '850',
      'label-excel': '754',
      '856': 'label-excel',
    };

    axios(
      `/api/file/${this.state.type === '856' ? 'archive' : 'edi'}/${typeMapper[this.state.type]}/${this.state.fileName}`
    )
      .then((response) => {
        const { file } = response.data.result;
        this.setState({ file, isLoading: false });

        if (this.state.type === '856') {
          this.formRef.current.setFieldsValue({
            carrier: Boolean(file.carrier) ? file.carrier.trim() : '',
            carrier_code: Boolean(file.carrier_code) ? file.carrier_code.trim() : '',
            pro: Boolean(file.pro) ? file.pro.trim() : '',
            total_carton: file.total_carton,
            total_pallet: file.total_pallet,
            weight: file.weight,
            weight_unit: Boolean(file.weight_unit) ? WEIGHT_MAP[file.weight_unit.trim()] : '',
            volume: file.volume,
            volume_unit: Boolean(file.volume_unit) ? VOLUME_MAP[file.volume_unit.trim()] : '',
            type: Boolean(file.type) ? file.type.trim() : '',
          });
        } else if (this.state.type === 'label-excel') {
          this.formRef.current.setFieldsValue({
            carrier: Boolean(file.carrier) ? file.carrier.trim() : '',
            carrier_code: Boolean(file.carrier_code) ? file.carrier_code.trim() : '',
            total_pallet: file.total_pallet,
          });
        } else if (this.state.type === '753') {
          this.formRef.current.setFieldsValue({
            to_street: file.address_street,
            to_city: file.address_city,
            to_state: file.address_state,
            to_zipcode: file.address_zip,
            to_country: file.address_country,
          });
        }
      })
      .catch((rejected) => {
        console.log(rejected);
        message.error('文件请求失败, 请稍候再试');
      });
  }

  /**
   * 处理替换生成中文档表格关闭
   */
  onSwitchModalClose() {
    this.setState({ switchingFiles: [] });
  }

  /**
   * 获取替换生成中文档表格的columns.
   *
   * @return {Array}
   */
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
            render: (text, record) =>
              record.date !== '' ? moment(record.date, 'YYYYMMDD').format('YYYY/MM/DD') : '无',
          },
          {
            title: 'Shipping Window',
            key: 'shipping_window',
            render: (text, { shipping_window }) => {
              const start =
                shipping_window && shipping_window.start !== ''
                  ? moment(shipping_window.start, 'YYYYMMDD').format('YYYY/MM/DD')
                  : '无';
              const end =
                shipping_window && shipping_window.end !== ''
                  ? moment(shipping_window.end, 'YYYYMMDD').format('YYYY/MM/DD')
                  : '无';

              return (
                <span>
                  {start} - {end}
                </span>
              );
            },
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
              return (
                <span>
                  <Button size='small' onClick={() => this.handleFileSwitch(record)}>
                    选择
                  </Button>
                </span>
              );
            },
          },
        ];

      case '856':
      case 'label-excel':
        return [
          {
            title: 'PO#',
            key: 'po_number',
            dataIndex: 'po_number',
          },
          {
            title: 'ARN',
            key: 'arn',
            dataIndex: 'arn',
          },
          {
            title: 'Carrier',
            key: 'carrier',
            dataIndex: 'carrier',
          },
          {
            title: '',
            key: 'actions',
            render: (text, record) => {
              return (
                <span>
                  <Button size='small' onClick={() => this.handleFileSwitch(record)}>
                    选择
                  </Button>
                </span>
              );
            },
          },
        ];
    }
  }

  /** @inheritdoc */
  render() {
    const { type } = this.state;
    const label = `Excel文档生成 (${type})`;

    return (
      <SiteLayout>
        <Head>
          <title>{label}</title>
        </Head>
        <Row type='flex'>
          <a
            className='ant-btn ant-btn-sm'
            onClick={() => Router.back()}
            title='返回主界面'
            style={{ marginBottom: 20 }}>
            返回
          </a>
          {/*&nbsp;&nbsp;*/}
          {/*{ type === '753'&& <Button loading={ this.state.isLoadingFiles } onClick={() => this.loadSwitchingFiles('850')} size="small">选择{Boolean(this.state.file) ? '其他' : ''}订单</Button> }*/}
          {/*{ type === 'label-excel' &&  <Button loading={ this.state.isLoadingFiles } onClick={() => this.loadSwitchingFiles('754')} size="small">选择{Boolean(this.state.file) ? '其他' : ''}754文档</Button> }*/}
          {/*{ type === '856' && <Button loading={ this.state.isLoadingFiles } onClick={() => this.loadSwitchingFiles('label-excel', 'archive')} size="small">选择{Boolean(this.state.file) ? '其他' : ''}标签文档</Button> }*/}
        </Row>

        <h2>Excel文档生成 ({type})</h2>
        <Row type='flex'>
          <Col span={14}>
            <Spin spinning={this.state.isLoading}>{this.getCreatingForm()}</Spin>
          </Col>
          {this.state.file !== null && <Col span={10}>{this.getFileDescription()}</Col>}
        </Row>

        <Modal
          width={800}
          onCancel={() => this.setState({ showSwitchModal: false })}
          visible={this.state.showSwitchModal}
          afterClose={this.onSwitchModalClose.bind(this)}>
          {this.state.showSwitchModal && (
            <Table
              loading={this.state.isLoadingFiles}
              dataSource={this.state.switchingFiles}
              columns={this.getSwitchTableColumns()}
            />
          )}
        </Modal>
      </SiteLayout>
    );
  }
}

export default withRouter(EdiFormView);
