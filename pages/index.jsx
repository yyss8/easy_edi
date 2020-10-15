import React, { Component } from 'react';
import Router from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import { Tabs, message, Button, Modal, Row, Col, Dropdown, Menu } from 'antd';
import { ArrowUpOutlined } from '@ant-design/icons';
import axios from 'axios';
import qs from 'qs';
import updater from 'immutability-helper';
import jsFileDownload from 'js-file-download';
import 'moment-timezone';
import moment from 'moment';

import SiteLayout from '../components/layout/SiteLayout';
import EdiDownloadTab from '../components/edi/EdiDownloadTab/EdiDownloadTab';
import EdiUploadTab from '../components/edi/EdiUploadTab/EdiUploadTab';
import OrderProductTable from '../components/edi/EdiTable/OrderProductTable/OrderProductTable';
import EdiDetails754 from '../components/edi/EdiDetails/EdiDetails754';

const { TabPane } = Tabs;

// 现有类型数据.
const SUPPORTED_INPUT_LIST = [
  {
    code: '850',
    name: '订单信息',
    type: 'download',
  },
  {
    code: '855',
    name: '订单确认',
    type: 'upload',
  },
  {
    code: '753',
    name: '申请ARN#',
    type: 'upload',
  },
  {
    code: '754',
    name: '确认ARN#',
    type: 'download',
  },
  {
    code: 'label-excel',
    name: '上传标签',
    type: 'upload',
    hideCode: true,
  },
  {
    code: 'label',
    name: '已生成标签',
    type: 'download',
    hideCode: true,
  },
  {
    code: '856',
    name: '发货通知',
    type: 'upload',
  },
  {
    code: '810',
    name: '发送发票',
    type: 'upload',
    disabled: true,
  },
  {
    code: 'logs',
    name: '文件日志',
    type: 'download',
    hideCode: true,
  },
  {
    code: 'notify',
    name: '网关通知',
    type: 'download',
    hideCode: true,
  },
];

/**
 * EDI工具页面.
 */
export default class extends Component {
  /** @inheritdoc */
  static async getInitialProps({ query }) {
    return {
      query,
    };
  }

  /** @inheritdoc */
  constructor(props) {
    super(props);

    const { query } = props;
    const hasPreload = Boolean(props.preload);
    const defaultType = query.type || '850';
    const defaultTypeObject = SUPPORTED_INPUT_LIST.find((o) => o.code === defaultType);
    const poDate = Boolean(query.poDate) ? moment(query.poDate, 'YYYY-MM-DD') : null;

    this.state = {
      type: defaultType,
      tabLoading: !hasPreload,
      files: hasPreload ? props.preload.files : [],
      fileType: Boolean(query.fileType) ? query.fileType : defaultTypeObject.type === 'download' ? 'edi' : 'upload',
      sorting: query.sort || 'created_DESC',
      keyword: query.keyword || '',
      poKeyword: query.poKeyword || '',
      arn: query.arn || '',
      carrier: query.carrier || '',
      poDate: moment.isMoment(poDate) && poDate.isValid() ? poDate : null,
      // 只有在下载界面或上传的归档界面时才加载文件列表.
      shouldInitFetch:
        defaultTypeObject.type === 'download' || (defaultTypeObject.type === 'upload' && query.fileType === 'archive'),
      selectedRowKeys: [],
    };

    this.fetchFiles = this.fetchFiles.bind(this);
    this.getTableColumns = this.getTableColumns.bind(this);
    this.getSubTableRenderer = this.getSubTableRenderer.bind(this);
  }

  /** @inheritdoc */
  componentDidMount() {
    if (typeof this.props.preload === 'undefined' && this.state.shouldInitFetch) {
      this.fetchFiles();
    }
  }

  /**
   * 获取文件列表.
   */
  fetchFiles() {
    const queryObject = {
      sorting: this.state.sorting,
    };

    if (Boolean(this.state.keyword)) {
      queryObject.keyword = this.state.keyword;
    }

    if (Boolean(this.state.poKeyword)) {
      queryObject.poKeyword = this.state.poKeyword;
    }

    if (Boolean(this.state.arn)) {
      queryObject.arn = this.state.arn;
    }

    if (Boolean(this.state.carrier)) {
      queryObject.carrier = this.state.carrier;
    }

    if (moment.isMoment(this.state.poDate)) {
      queryObject.poDate = this.state.poDate.format('YYYYMMDD');
    }

    axios
      .get(`/api/files/${this.state.fileType}/${this.state.type}?${qs.stringify(queryObject)}`)
      .then((response) => {
        this.setState({
          files: response.data.result.files.map((f, k) => ({ ...f, key: `file-${k}` })),
          tabLoading: false,
          selectedRowKeys: [],
        });
      })
      .catch((rejected) => {
        message.error('获取文件出错');
        console.log(rejected);
      });
  }

  /**
   * 更新tab内容.
   *
   * @param {string} key 所选key.
   */
  tabOnchange(key) {
    const selectedTypeObject = SUPPORTED_INPUT_LIST.find((o) => o.code === key);

    if (selectedTypeObject.disabled === true) {
      message.warning(`本地EDI系统暂不支持该类型 - ${selectedTypeObject.name} (${selectedTypeObject.code})`);
      return;
    }

    this.setState(
      {
        type: key,
        tabLoading: true,
        fileType: selectedTypeObject.type === 'download' ? 'edi' : 'upload',
        files: [],
        ...this.getDefaultFilters(),
      },
      () => {
        if (selectedTypeObject.type === 'download') {
          this.fetchFiles();
        }

        Router.push({
          pathname: '/',
          query: this.buildPushQuery(),
        });
      }
    );
  }

  /**
   * 筛选内容改动.
   *
   * @param {T} value
   *   筛选内容.
   * @param {string} field
   *   筛选字段名.
   * @param {boolean} shouldUpdate
   *   是否要刷新文件列表.
   */
  filterOnchange(value, field, shouldUpdate = true) {
    // 上传界面无需获取文件, 直接跳转至创建界面.
    this.setState({ [field]: value }, () => {
      if (!shouldUpdate) {
        return;
      }

      if (field === 'fileType' && value === 'upload') {
        return;
      }

      this.setState({ tabLoading: true, files: [] }, () => {
        Router.push({
          pathname: '/',
          query: this.buildPushQuery(),
        });

        this.fetchFiles();
      });
    });
  }

  /**
   * 获取筛选内容默认值
   *
   * @return {Object}}
   */
  getDefaultFilters() {
    return {
      sorting: 'created_DESC',
      keyword: '',
      poDate: null,
      poKeyword: '',
      arn: '',
      carrier: '',
    };
  }

  /**
   * 刷新现有文件列表.
   */
  onRefresh() {
    this.setState({ tabLoading: true, files: [] }, this.fetchFiles);
  }

  /**
   * 获取当前类型标签名称.
   *
   * @param {Object} typeObject
   *   当前选择的类型object.
   *
   * @return {string}
   *   标签名称.
   */
  getLabel(typeObject) {
    return `${typeObject.name}${typeObject.hideCode !== true ? ` (${typeObject.code})` : ''}`;
  }

  /**
   * 获取文件大小单位.
   *
   * @param {Number} size
   *   文件大小
   *
   * @return {string}
   *   带有单位的文件大小.
   */
  getFileSize(size) {
    const sizeUnit = ['Bytes', 'kb', 'mb', 'gb'];
    let i = 0;

    while (size > 900) {
      size /= 1024;
      i++;
    }

    return `${Math.round(size * 100) / 100} ${sizeUnit[i]}`;
  }

  /**
   * 删除文件.
   *
   * @param {string} name
   *   文件名.
   */
  handleFileDelete(name) {
    Modal.confirm({
      title: '确认删除该文件? 该操作将无法恢复',
      onOk: () => {
        return new Promise((finished) => {
          axios
            .post(`/api/delete/${this.state.type}/${name}`)
            .then((response) => {
              const { data } = response;

              if (data.status === 'ok' && data.result.deleted === 1) {
                message.success('文件删除成功');
                this.onRefresh();
              } else {
                message.error('文件删除出错');
              }

              finished();
            })
            .catch((rejected) => {
              message.error('文件删除请求出错');
              console.log(rejected);
              finished();
            });
        });
      },
    });
  }

  /**
   * 获取当前筛选条件的query.
   *
   * @return {Object}
   *   query.
   */
  buildPushQuery() {
    const query = {};

    if (this.state.type !== '850') {
      query.type = this.state.type;
    }

    if (this.state.fileType !== 'edi') {
      query.fileType = this.state.fileType;
    }

    if (Boolean(this.state.keyword)) {
      query.keyword = this.state.keyword;
    }

    if (this.state.sorting !== 'created_DESC') {
      query.sort = this.state.sorting;
    }

    if (Boolean(this.state.poKeyword)) {
      query.poKeyword = this.state.poKeyword;
    }

    if (Boolean(this.state.arn)) {
      query.arn = this.state.arn;
    }

    if (Boolean(this.state.carrier)) {
      query.carrier = this.state.carrier;
    }

    if (moment.isMoment(this.state.poDate)) {
      query.poDate = this.state.poDate.format('YYYY-MM-DD');
    }

    return query;
  }

  /**
   * 归档文件。
   *
   * @param {string} name
   *   文件名
   */
  archiveFile(name) {
    Modal.confirm({
      title: '确认归档该文件?',
      onOk: () => {
        return new Promise((finished) => {
          axios
            .post(`/api/archive/${this.state.type}/${name}`)
            .then((response) => {
              message.success('文件归档成功');
              this.onRefresh();
              finished();
            })
            .catch((rejected) => {
              message.error('文件归档请求出错');
              console.log(rejected);
              finished();
            });
        });
      },
    });
  }

  /**
   * 删除文件。
   *
   * @param {string} name
   *   文件名
   */
  deleteFile(name) {
    Modal.confirm({
      title: '确认删除该文件?',
      onOk: () => {
        return new Promise((finished) => {
          axios
            .delete(`/api/delete/${this.state.type}/${name}`)
            .then((response) => {
              message.success('文件删除成功');
              this.onRefresh();
              finished();
            })
            .catch((rejected) => {
              message.error('文件删除请求出错');
              console.log(rejected);
              finished();
            });
        });
      },
    });
  }

  /**
   * 处理表格已/未选.
   *
   * @param {Array} selectedRowKeys
   *   已选择行.
   */
  onSelectItemChange(selectedRowKeys) {
    this.setState({ selectedRowKeys });
  }

  /**
   * 处理表格文件选择.
   *
   * @param {Object} record
   *   文件数据.
   * @param {boolean} selected
   *   是否被选择.
   */
  onSelectFile(record, selected) {
    const index = this.state.files.findIndex((data) => data.name === record.name);
    const files = updater(this.state.files, {
      [index]: {
        isSelected: { $set: selected },
      },
    });

    this.setState({ files });
  }

  /**
   * 处理表格选择所有文件.
   *
   * @param {boolean} isSelected
   *   是否被选择.
   * @param {Array} selectedRows
   *   已选择行.
   */
  onSelectAllFiles(isSelected, selectedRows) {
    const updating = {};

    selectedRows.forEach((row) => {
      const index = this.state.files.findIndex((data) => data.name === row.name);
      updating[index] = {
        isSelected: { $set: isSelected },
      };
    });

    this.setState({
      files: updater(this.state.files, updating),
    });
  }

  /**
   * 搜索同文件名的链接并模拟点击下载.
   */
  downloadFile(name) {
    document.querySelector(`[data-file-name="${name}"]`).click();
  }

  /**
   * 处理批量下载文件.
   */
  bulkDownload() {
    const selectedLength = this.state.selectedRowKeys.length;
    if (selectedLength === 0) {
      message.error('尚未选择任何文件.');
      return;
    }

    Modal.confirm({
      title: `确认下载所选${selectedLength}个文件?`,
      onOk: () => {
        return new Promise((finished) => {
          axios
            .post(
              `/api/bulk/download/${this.state.type}`,
              {
                fileType: this.state.fileType,
                fileNames: this.state.files.filter((file) => file.isSelected).map((file) => file.name),
              },
              {
                responseType: 'arraybuffer',
              }
            )
            .then((response) => {
              jsFileDownload(
                response.data,
                `${this.state.type}-${moment().tz('America/New_York').format('YYYYMMDD-HHmmss')}.zip`
              );
              this.setState({
                files: this.state.files.map((file) =>
                  updater(file, {
                    $unset: ['isSelected'],
                  })
                ),
                selectedRowKeys: [],
              });
              message.success('文件下载成功');
              finished();
            })
            .catch((rejected) => {
              console.log(rejected);
              message.error('批量下载请求出错, 请稍候再试...');
              finished();
            });
        });
      },
    });
  }

  /**
   * 获取不同文档类型独有的columns.
   *
   * @param {string} type
   *   文档类型.
   *
   * @return {Array}
   */
  getColumnsByType(type) {
    switch (type) {
      case '850':
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
            title: '商品数量',
            key: 'product_number',
            render: (text, record) => record.products.reduce((total, p) => total + Number(p.quantity), 0),
          },
        ];
      case '754':
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
        ];

      case 'label-excel':
        return [
          {
            title: 'ARN',
            key: 'arn',
            dataIndex: 'arn',
          },
          {
            title: 'ASIN',
            key: 'asin',
            dataIndex: 'asin',
          },
          {
            title: 'Description',
            key: 'description',
            dataIndex: 'product_title',
          },
        ];
    }

    return [];
  }

  /**
   * 处理批量归档文件.
   */
  bulkArchive() {
    const selectedLength = this.state.selectedRowKeys.length;
    if (selectedLength === 0) {
      message.error('尚未选择任何文件.');
      return;
    }

    Modal.confirm({
      title: '确认归档所选文件?',
      onOk: () => {
        return new Promise((finished) => {
          axios
            .post(`/api/bulk/archive/${this.state.type}`, {
              fileNames: this.state.files.filter((file) => file.isSelected).map((file) => file.name),
            })
            .then((response) => {
              message.success(`成功归档${response.data.result.archived}个文件.`);
              this.setState(
                {
                  files: this.state.files.map((file) =>
                    updater(file, {
                      $unset: ['isSelected'],
                    })
                  ),
                  selectedRowKeys: [],
                },
                this.fetchFiles
              );
              finished();
            })
            .catch((rejected) => {
              console.log(rejected);
              message.error('批量归档请求出错, 请稍候再试...');
              finished();
            });
        });
      },
    });
  }

  /**
   * 处理批量删除文件.
   */
  bulkDelete() {
    const selectedLength = this.state.selectedRowKeys.length;
    if (selectedLength === 0) {
      message.error('尚未选择任何文件.');
      return;
    }

    Modal.confirm({
      title: '确认删除所选文件?',
      onOk: () => {
        return new Promise((finished) => {
          axios
            .delete(`/api/bulk/delete/${this.state.type}`, {
              data: {
                fileNames: this.state.files.filter((file) => file.isSelected).map((file) => file.name),
              },
            })
            .then((response) => {
              message.success(`成功删除${response.data.result.deleted}个文件.`);
              this.setState(
                {
                  files: this.state.files.map((file) =>
                    updater(file, {
                      $unset: ['isSelected'],
                    })
                  ),
                  selectedRowKeys: [],
                },
                this.fetchFiles
              );
              finished();
            })
            .catch((rejected) => {
              console.log(rejected);
              message.error('批量删除请求出错, 请稍候再试...');
              finished();
            });
        });
      },
    });
  }

  /**
   * 获取不同文档类型的表格列.
   */
  getTableColumns() {
    const defaultFileColumns = [
      {
        title: '文件名',
        render: (text, record) => (
          <a
            href={`/api/download/${this.state.fileType}/${this.state.type}/${record.name}`}
            data-file-name={record.name}
            title='点击下载'
            download>
            {record.name}
          </a>
        ),
        key: 'name',
      },
      {
        title: '更新日期',
        dataIndex: 'modified',
        key: 'modified',
      },
      {
        title: '创建日期',
        dataIndex: 'created',
        key: 'created',
      },
      {
        title: '操作',
        render: (text, record) => {
          return (
            <span>
              <Button size='small' title='点击下载' onClick={() => this.downloadFile(record.name)}>
                下载文件
              </Button>
              {this.state.fileType === 'edi' && (
                <Button style={{ marginLeft: 8 }} size='small' onClick={() => this.archiveFile(record.name)}>
                  归档
                </Button>
              )}
              {this.state.fileType === 'archive' && (
                <Button
                  style={{ marginLeft: 8 }}
                  type='danger'
                  size='small'
                  onClick={() => this.deleteFile(record.name)}>
                  删除
                </Button>
              )}

              {
                this.state.fileType === 'edi' && this.state.type === '850' && <Dropdown overlay={<Menu>
                  <Menu.Item>
                    <Link href={`/form/753?fileName=${encodeURI(record.name)}`}>
                      <a title='生成753文档'>
                        生成753
                      </a>
                    </Link>
                  </Menu.Item>
                  <Menu.Item>
                    <Link href={`/form/855?fileName=${encodeURI(record.name)}`}>
                      <a title='生成855文档'>
                        生成855
                      </a>
                    </Link>
                  </Menu.Item>
                </Menu>} placement="bottomRight" arrow>
                  <Button style={{ marginLeft: 8 }} size="small">生成文档</Button>
                </Dropdown>
              }

              {this.state.fileType === 'edi' && this.state.type === '754' && (
                <Link href={`/form/label-excel?fileName=${encodeURI(record.name)}`}>
                  <a title='生成标签文档' className='ant-btn ant-btn-sm' style={{ marginLeft: 8 }}>
                    生成标签文档
                  </a>
                </Link>
              )}
              {this.state.fileType === 'archive' && this.state.type === 'label-excel' && (
                <Link href={`/form/856?fileName=${encodeURI(record.name)}`}>
                  <a title='生成标签文档' className='ant-btn ant-btn-sm' style={{ marginLeft: 8 }}>
                    生成856
                  </a>
                </Link>
              )}
              {/*<Button size="small" onClick={ () => this.handleFileDelete(record.name) } type="danger">删除文件</Button>*/}
            </span>
          );
        },
      },
    ];

    if (this.state.type === 'label') {
      defaultFileColumns.splice(1, 0, {
        title: '文件大小',
        key: 'size',
        render: (text, record) => <span>{this.getFileSize(record.size)}</span>,
      });
    }

    return [defaultFileColumns.shift(), ...this.getColumnsByType(this.state.type), ...defaultFileColumns];
  }

  /**
   * 获取不同表格类型的子表格内容.
   */
  getSubTableRenderer() {
    switch (this.state.type) {
      case '850':
        return (record, index) => {
          const products = record.products.map((p, i) => ({ ...p, key: `row-${index}-p-${i}` }));
          return <OrderProductTable products={products} />;
        };

      case '754':
        return (record) => (
          <Row>
            <Col offset={3} span={14}>
              <EdiDetails754 file={record} />
            </Col>
          </Row>
        );

      default:
        return null;
    }
  }

  /** @inheritdoc */
  render() {
    const selectedType = SUPPORTED_INPUT_LIST.find((item) => item.code === this.state.type);
    const label = this.getLabel(selectedType);

    const fileColumns = this.state.fileType === 'upload' ? [] : this.getTableColumns();
    const tableRowSelection =
      this.state.fileType === 'upload'
        ? {}
        : {
            onSelect: this.onSelectFile.bind(this),
            onSelectAll: this.onSelectAllFiles.bind(this),
            onChange: this.onSelectItemChange.bind(this),
            selectedRowKeys: this.state.selectedRowKeys,
            getCheckboxProps: (record) => ({ selectedRowKeys: record.isSelected }),
          };

    const commonProps = {
      fileColumns,
      tableRowSelection,
      files: this.state.files,
      tabLoading: this.state.tabLoading,
      sorting: this.state.sorting,
      keyword: this.state.keyword,
      fileType: this.state.fileType,
      type: this.state.type,
      poKeyword: this.state.poKeyword,
      arn: this.state.arn,
      carrier: this.state.carrier,
      filterOnchange: this.filterOnchange.bind(this),
      onRefresh: this.onRefresh.bind(this),
      bulkDownload: this.bulkDownload.bind(this),
    };

    return (
      <SiteLayout>
        <Head>
          <title>{label} - Easy EDI</title>
        </Head>
        <h2>{label}</h2>
        <Tabs
          className='jt-edi-tabs'
          activeKey={this.state.type}
          tabPosition='left'
          onChange={this.tabOnchange.bind(this)}>
          {SUPPORTED_INPUT_LIST.map((code, index) => {
            return (
              <TabPane
                key={code.code}
                tab={
                  <span>
                    {this.getLabel(code)} <ArrowUpOutlined className={code.type} />
                  </span>
                }>
                {code.type === 'download' && (
                  <EdiDownloadTab
                    poDate={this.state.poDate}
                    subTableRendered={this.getSubTableRenderer()}
                    bulkArchive={this.bulkArchive.bind(this)}
                    bulkDelete={this.bulkDelete.bind(this)}
                    {...commonProps}
                  />
                )}
                {code.type === 'upload' && <EdiUploadTab {...commonProps} />}
              </TabPane>
            );
          })}
        </Tabs>
      </SiteLayout>
    );
  }
}
