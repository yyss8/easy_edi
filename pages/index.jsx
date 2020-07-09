import React, { Component } from 'react';
import Router from 'next/router';
import Head from 'next/head'
import Link from 'next/link';
import { Tabs, Table, message, Button, Upload, Row, Col, Select, Input, Modal, Radio } from 'antd';
import { InboxOutlined, ArrowUpOutlined, SyncOutlined } from '@ant-design/icons';
import axios from 'axios';
import qs from 'qs';

import SiteLayout from '../components/layout/SiteLayout';
const { TabPane } = Tabs;
const { Dragger } = Upload;

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

  onUpdateTabContent() {

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

    this.setState({type: key, tabLoading: true, sorting: 'name_ASC', keyword: '', fileType: selectedTypeObject.type === 'download' ? 'edi' : 'upload'}, () => {
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

  onRefresh() {
    this.setState({tabLoading: true, files: []}, this.fetchFiles);
  }

  getLabel(typeObject) {
    return `${typeObject.name}${typeObject.hideCode !== true ? ` (${typeObject.code})` : ''}`;
  }
  
  getFileSize(size) {
    const sizeUnit = ['Bytes', 'kb', 'mb', 'gb'];
    let i = 0;

    while (size > 900) {
      size /= 1024; i++;
    }

    return `${Math.round(size * 100) / 100} ${sizeUnit[i]}`;
  }

  getUploadDescription() {
    switch (this.state.type) {
      case 'label-excel':
        return <h3>成功上传标签后请等待2-3秒然后到<a href="/?type=label">已生成标签</a>查看生成结果.
        </h3>

      case '856':
      case '753':
      default:
        return <h3>
          请至亚马逊Operational Analytics页面查看发送结果或查看<a href="/?type=997">发送回执</a>或<a href="/?type=error">错误信息</a>.
        </h3>
    }
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

    const uploadProps = {
      name: 'file',
      multiple: true,
      action: `/api/upload/${this.state.type}`,
      style: {width: 800},
      showUploadList: false,
      accept: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel',
      onChange(info) {
        const { status } = info.file;

        if (status === 'done') {
          message.success(`${info.file.name}文件已成功上传.`);
        } else if (status === 'warning') {
          message.warning(`${info.file.name}文件上传成功但尚未被EDI处理, 请检查EDI后台服务是否启动.`);
        } else if (status === 'error') {
          message.error(`${info.file.name}文件上传出错: ${info.file.errorMessage}`);
        }
      },
    };

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
                code.type === 'download' && <React.Fragment>
                  <Row style={{marginBottom: 10}}>
                    <Col span={ 18 }>
                      <Row>
                        <Col span={ 4 }>
                          <Radio.Group value={this.state.fileType} onChange={ e => this.filterOnchange(e.target.value, 'fileType') }>
                            <Radio.Button value="edi">EDI</Radio.Button>
                            <Radio.Button value="archive">归纳</Radio.Button>
                          </Radio.Group>
                        </Col>
                        <Col span={ 4 }>
                          <Select style={ {width: '100%'} } title="排序方式" value={this.state.sorting} onChange={ value => this.filterOnchange(value, 'sorting') }>
                            <Select.Option value="created_DESC">创建时间 (新到旧)</Select.Option>
                            <Select.Option value="created_ASC">创建时间 (旧到新)</Select.Option>
                            <Select.Option value="modified_DESC">编辑时间 (新到旧)</Select.Option>
                            <Select.Option value="modified_ASC">编辑时间 (旧到新)</Select.Option>
                            <Select.Option value="name_ASC">文件名 (a-z)</Select.Option>
                            <Select.Option value="name_DESC">文件名 (z-a)</Select.Option>
                          </Select>
                        </Col>
                        <Col offset={ 1 } span={ 4 }>
                          <Input.Search placeholder="搜索文件名" title="输入文件名关键字" onSearch={this.onRefresh.bind(this)} value={ this.state.keyword } onChange={e => this.filterOnchange(e.target.value, 'keyword', false)} />
                        </Col>
                      </Row>
                    </Col>
                    <Col style={{textAlign: 'right'}} span={ 6 }>
                      <Button icon={ <SyncOutlined /> } onClick={this.onRefresh.bind(this)} title="刷新文件" />
                    </Col>
                  </Row>
                  <Table loading={this.state.tabLoading} dataSource={this.state.files} columns={fileColumns} />
                </React.Fragment>
              }
              { code.type === 'upload' && <React.Fragment>
                <Row style={{marginBottom: 10}}>
                  <Col span={ 18 }>
                    <Row>
                      <Col span={ 4 }>
                        <Radio.Group value={this.state.fileType} onChange={ e => this.filterOnchange(e.target.value, 'fileType') }>
                          <Radio.Button value="upload">上传</Radio.Button>
                          <Radio.Button value="archive">归纳</Radio.Button>
                        </Radio.Group>
                      </Col>
                      {
                        this.state.fileType === 'archive' && <React.Fragment>
                          <Col span={ 4 }>
                            <Select style={ {width: '100%'} } title="排序方式" value={this.state.sorting} onChange={ value => this.filterOnchange(value, 'sorting') }>
                              <Select.Option value="created_DESC">创建时间 (新到旧)</Select.Option>
                              <Select.Option value="created_ASC">创建时间 (旧到新)</Select.Option>
                              <Select.Option value="modified_DESC">编辑时间 (新到旧)</Select.Option>
                              <Select.Option value="modified_ASC">编辑时间 (旧到新)</Select.Option>
                              <Select.Option value="name_ASC">文件名 (a-z)</Select.Option>
                              <Select.Option value="name_DESC">文件名 (z-a)</Select.Option>
                            </Select>
                          </Col>
                          <Col offset={ 1 } span={ 4 }>
                            <Input.Search placeholder="搜索文件名" title="输入文件名关键字" onSearch={this.onRefresh.bind(this)} value={ this.state.keyword } onChange={e => this.filterOnchange(e.target.value, 'keyword', false)} />
                          </Col>
                        </React.Fragment>
                      }
                    </Row>
                  </Col>
                  {
                    this.state.fileType === 'archive' && <Col style={{textAlign: 'right'}} span={ 6 }>
                      <Button icon={ <SyncOutlined /> } onClick={this.onRefresh.bind(this)} title="刷新文件" />
                    </Col>
                  }
                </Row>
                {
                  this.state.fileType === 'upload' ? <div>
                    { this.getUploadDescription.call(this) }
                    <Dragger {...uploadProps}>
                      <p className="ant-upload-drag-icon">
                        <InboxOutlined />
                      </p>
                      <p className="ant-upload-text">点击此处或拖拽Excel文件开始上传</p>
                      <p className="ant-upload-text">支持多文件上传</p>
                    </Dragger>
                  </div> : <Table loading={this.state.tabLoading} dataSource={this.state.files} columns={fileColumns} />
                }
              </React.Fragment> }
            </TabPane>;
          })
        }
      </Tabs>
    </SiteLayout>
  }
}
