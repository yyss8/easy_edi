import React, { Component } from 'react';
import Router from 'next/router';
import Head from 'next/head'
import { Tabs, message, Button, Modal } from 'antd';
import { ArrowUpOutlined } from '@ant-design/icons';
import axios from 'axios';
import qs from 'qs';
import updater from 'immutability-helper';
import jsFileDownload from 'js-file-download';
import 'moment-timezone';
import moment from 'moment';

import SiteLayout from '../components/layout/SiteLayout';
import EdiDownloadTab from "../components/edi/EdiDownloadTab/EdiDownloadTab";
import EdiUploadTab from "../components/edi/EdiUploadTab/EdiUploadTab";

const { TabPane } = Tabs;

// 现有类型数据.
const SUPPORTED_INPUT_LIST = [
  {
    code: '850',
    name: '订单信息',
    type: 'download'
  },
  {
    code: '855',
    name: '订单确认',
    type: 'upload',
    disabled: true,
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
    code: '997',
    name: '发送回执',
    type: 'download',
  },
  {
    code: 'error',
    name: '错误处理',
    type: 'download',
    hideCode: true,
  },
];

/**
 * EDI工具页面.
 */
export default class extends Component {

  /** @inheritdoc */
  static async getInitialProps({query}) {
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
    const defaultTypeObject = SUPPORTED_INPUT_LIST.find(o => o.code === defaultType);

    this.state = {
      type: defaultType,
      tabLoading: !hasPreload,
      files: hasPreload ? props.preload.files : [],
      fileType: Boolean(query.fileType) ? query.fileType : defaultTypeObject.type === 'download' ?  'edi' : 'upload',
      sorting: query.sort || 'created_DESC',
      keyword: query.keyword || '',
      // 只有在下载界面或上传的归档界面时才加载文件列表.
      shouldInitFetch: defaultTypeObject.type === 'download' || (defaultTypeObject.type === 'upload' && query.fileType === 'archive'),
      selectedRowKeys: [],
    };

    this.fetchFiles = this.fetchFiles.bind(this);
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

    axios.get(`/api/files/${this.state.fileType}/${this.state.type}?${qs.stringify(queryObject)}`)
      .then(response => {
        this.setState({
          files: response.data.result.files.map((f, k) => ({...f, key: `file-${k}`})),
          tabLoading: false,
          selectedRowKeys: []
        });
      })
      .catch(rejected => {
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
    const selectedTypeObject = SUPPORTED_INPUT_LIST.find(o => o.code === key);

    if (selectedTypeObject.disabled === true) {
      message.warning(`本地EDI系统暂不支持该类型 - ${selectedTypeObject.name} (${selectedTypeObject.code})`);
      return;
    }

    this.setState({type: key, tabLoading: true, sorting: 'created_DESC', keyword: '', fileType: selectedTypeObject.type === 'download' ? 'edi' : 'upload', files: []}, () => {
      if (selectedTypeObject.type === 'download') {
        this.fetchFiles();
      }

      Router.push({
        pathname : '/',
        query: this.buildPushQuery(),
      });
    });
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
    this.setState({[field]: value}, () => {
      if (!shouldUpdate) {
        return;
      }

      this.setState({tabLoading: true, files: []}, () => {
        Router.push({
          pathname : '/',
          query: this.buildPushQuery(),
        });

        // 上传界面无需获取文件.
        if (field === 'fileType' && value === 'upload') {
          return;
        }

        this.fetchFiles();
      });
    });
  }

  /**
   * 刷新现有文件列表.
   */
  onRefresh() {
    this.setState({tabLoading: true, files: []}, this.fetchFiles);
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
      size /= 1024; i++;
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
        return new Promise(finished => {
          axios.post(`/api/delete/${this.state.type}/${name}`)
            .then(response => {
              const { data } = response;

              if (data.status === 'ok' && data.result.deleted === 1) {
                message.success("文件删除成功");
                this.onRefresh();
              } else {
                message.error('文件删除出错');
              }

              finished();
            })
            .catch(rejected => {
              message.error('文件删除请求出错');
              console.log(rejected);
              finished();
            });
        });
      }
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
        return new Promise(finished => {
          axios.post(`/api/archive/${this.state.type}/${name}`)
            .then(response => {
              message.success('文件归档成功');
              this.onRefresh();
              finished();
            })
            .catch(rejected => {
              message.error('文件归档请求出错');
              console.log(rejected);
              finished();
            });
        });
      }
    });
  }

  onSelectItemChange(selectedRowKeys) {
    this.setState({selectedRowKeys});
  }

  onSelectFile(record, selected) {
    const index = this.state.files.findIndex((data) => data.name === record.name);
    const files = updater(this.state.files, {
      [index]: {
        isSelected: { $set: selected },
      },
    });

    this.setState({ files });
  }

  onSelectAllFiles(isSelected, selectedRows) {
    const updating = {};

    selectedRows.forEach(row => {
      const index = this.state.files.findIndex((data) => data.name === row.name);
      updating[index] = {
        isSelected: { $set: isSelected}
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

  bulkDownload() {
    const selectedLength = this.state.selectedRowKeys.length;
    if (selectedLength === 0) {
      message.error('尚未选择任何文件.');
      return;
    }

    Modal.confirm({
      title: `确认下载所选${selectedLength}个文件?`,
      onOk: () => {
        return new Promise(finished => {
          axios.post(`/api/bulk/download/${this.state.type}`, {
            fileType: this.state.fileType,
            fileNames: this.state.files.filter(file => file.isSelected).map(file => file.name),
          }, {
            responseType: 'arraybuffer',
          })
            .then(response => {
              jsFileDownload(response.data, `${this.state.type}-${moment().tz('America/New_York').format('YYYYMMDD-HHmmss')}.zip`);
              this.setState({
                files: this.state.files.map(file => updater(file, {
                  $unset: ['isSelected'],
                })),
                selectedRowKeys: [],
              });
              message.success('文件下载成功');
              finished();
            })
            .catch(rejected => {
              console.log(rejected);
              message.error('批量下载请求出错, 请稍候再试...');
              finished();
            });
        });
      },
    });
  }

  show854ProductTable() {

  }

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
    }

    return [];
  }

  bulkArchive() {
    Modal.confirm({
      title: '确认归档所选文件?',
      onOk:() => {
        return new Promise(finished => {
          axios.post(`/api/bulk/archive/${this.state.type}`, {
            fileNames: this.state.files.filter(file => file.isSelected).map(file => file.name),
          })
            .then(response => {
              message.success(`成功归档${response.data.result.archived}个文件.`);
              this.setState({
                files: this.state.files.map(file => updater(file, {
                  $unset: ['isSelected'],
                })),
                selectedRowKeys: [],
              }, this.fetchFiles);
              finished();
            })
            .catch(rejected => {
              console.log(rejected);
              message.error('批量下载请求出错, 请稍候再试...');
              finished();
            });
        });
      }
    });
  }

  /** @inheritdoc */
  render() {
    const selectedType = SUPPORTED_INPUT_LIST.find(item => item.code === this.state.type);
    const label = this.getLabel(selectedType);
    const defaultFileColumns = [
      {
        title: '文件名',
        render: (text, record) => <a href={ `/api/download/${this.state.type}/${record.name}` } data-file-name={ record.name } title="点击下载" download>{record.name}</a>,
        key: 'name',
      },
      {
        title: '文件大小',
        render: (text, record) => <span>{this.getFileSize(record.size)}</span>,
        key: 'size',
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
          return <span>
            <Button size="small" title="点击下载" onClick={ () => this.downloadFile(record.name) }>下载文件</Button>
            { this.state.fileType === 'edi' && <Button style={ {marginLeft: 8} } size="small" onClick={ () => this.archiveFile(record.name) }>归档</Button> }
            {/*<Button size="small" onClick={ () => this.handleFileDelete(record.name) } type="danger">删除文件</Button>*/}
          </span>
        },
      }
    ];
    const fileColumns = [
      defaultFileColumns.shift(),
      ...this.getColumnsByType(this.state.type),
      ...defaultFileColumns,
    ];

    const tableRowSelection = {
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
      filterOnchange: this.filterOnchange.bind(this),
      onRefresh: this.onRefresh.bind(this),
      bulkDownload: this.bulkDownload.bind(this),
    };

    return <SiteLayout>
      <Head>
        <title>{label} - Easy EDI</title>
      </Head>
      <h2>{label}</h2>
      <Tabs className="jt-edi-tabs" activeKey={this.state.type} tabPosition="left" onChange={ this.tabOnchange.bind(this) }>
        {
          SUPPORTED_INPUT_LIST.map((code, index) => {
            return <TabPane key={ code.code } tab={ <span>{this.getLabel(code)} <ArrowUpOutlined className={ code.type } /></span> }>
              {
                code.type === 'download' && <EdiDownloadTab bulkArchive={this.bulkArchive.bind(this)} {...commonProps} />
              }
              { code.type === 'upload' && <EdiUploadTab type={this.state.type} {...commonProps} /> }
            </TabPane>;
          })
        }
      </Tabs>
    </SiteLayout>
  }
}
