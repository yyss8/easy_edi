import React, { Component } from 'react';
import Router from 'next/router';
import Head from 'next/head'
import { Tabs, message, Button, Modal } from 'antd';
import { ArrowUpOutlined } from '@ant-design/icons';
import axios from 'axios';
import qs from 'qs';

import SiteLayout from '../components/layout/SiteLayout';
import EdiDownloadTab from "../components/layout/EdiDownloadTab/EdiDownloadTab";
import EdiUploadTab from "../components/layout/EdiUploadTab/EdiUploadTab";

const { TabPane } = Tabs;

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

export default class extends Component {

  static async getInitialProps({query}) {
    return {
      query,
    };
  }

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
      // 只有在下载界面或上传的归纳界面时才加载文件列表.
      shouldInitFetch: defaultTypeObject.type === 'download' || (defaultTypeObject.type === 'upload' && query.fileType === 'archive'),
    };

    this.fetchFiles = this.fetchFiles.bind(this);
  }

  componentDidMount() {
    if (typeof this.props.preload === 'undefined' && this.state.shouldInitFetch) {
      this.fetchFiles();
    }
  }

  fetchFiles() {
    const queryObject = {
      sorting: this.state.sorting,
    };

    if (Boolean(this.state.keyword)) {
      queryObject.keyword = this.state.keyword;
    }

    axios.get(`/api/files/${this.state.fileType}/${this.state.type}?${qs.stringify(queryObject)}`)
      .then(response => {
        this.setState({files: response.data.result.files.map((f, k) => ({...f, key: `file-${k}`})), tabLoading: false});
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

    this.setState({type: key, tabLoading: true, sorting: 'created_DESC', keyword: '', fileType: selectedTypeObject.type === 'download' ? 'edi' : 'upload'}, () => {
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
   */
  getLabel(typeObject) {
    return `${typeObject.name}${typeObject.hideCode !== true ? ` (${typeObject.code})` : ''}`;
  }

  /**
   * 获取文件大小单位.
   */
  getFileSize(size) {
    const sizeUnit = ['Bytes', 'kb', 'mb', 'gb'];
    let i = 0;

    while (size > 900) {
      size /= 1024; i++;
    }

    return `${Math.round(size * 100) / 100} ${sizeUnit[i]}`;
  }

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

  archiveFile(name) {
    Modal.confirm({
      title: '确认归纳该文件?',
      onOk: () => {
        return new Promise(finished => {
          axios.post(`/api/archive/${this.state.type}/${name}`)
            .then(response => {
              message.success('文件归纳成功');
              this.onRefresh();
              finished();
            })
            .catch(rejected => {
              message.error('文件归纳请求出错');
              console.log(rejected);
              finished();
            });
        });
      }
    });
  }

  downloadFile(name) {
    document.querySelector(`[data-file-name="${name}"]`).click();
  }

  render() {
    const selectedType = SUPPORTED_INPUT_LIST.find(item => item.code === this.state.type);
    const label = this.getLabel(selectedType);
    const fileColumns = [
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

    return <SiteLayout>
      <Head>
        <title>{label} - Easy EDI</title>
      </Head>
      <h2>{label}</h2>
      <Tabs className="jt-edi-tabs" activeKey={this.state.type} tabPosition="left" onChange={ this.tabOnchange.bind(this) }>
        {
          SUPPORTED_INPUT_LIST.map((code, index) => {
            return <TabPane key={ code.code } disable={code.disabled} tab={ <span>{this.getLabel(code)} <ArrowUpOutlined className={ code.type } /></span> }>
              {
                code.type === 'download' && <EdiDownloadTab fileType={this.state.fileType}
                                                            sorting={this.state.sorting}
                                                            keyword={this.state.keyword}
                                                            tabLoading={this.state.tabLoading}
                                                            files={this.state.files}
                                                            fileColumns={fileColumns}
                                                            filterOnchange={this.filterOnchange.bind(this)}
                                                            onRefresh={this.onRefresh.bind(this)} />
              }
              { code.type === 'upload' && <EdiUploadTab type={this.state.type}
                                                        fileType={this.state.fileType}
                                                        sorting={this.state.sorting}
                                                        keyword={this.state.keyword}
                                                        tabLoading={this.state.tabLoading}
                                                        files={this.state.files}
                                                        fileColumns={fileColumns}
                                                        filterOnchange={this.filterOnchange.bind(this)}
                                                        onRefresh={this.onRefresh.bind(this)} /> }
            </TabPane>;
          })
        }
      </Tabs>
    </SiteLayout>
  }
}
