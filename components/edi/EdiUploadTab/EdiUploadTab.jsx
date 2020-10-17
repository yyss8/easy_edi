import { Button, Col, message, Radio, Row, Table, Upload } from 'antd';
import React from 'react';
import { InboxOutlined, SyncOutlined } from '@ant-design/icons';

import EdiTableFilters from '../EdiTableFilters/EdiTableFilters';
import UploadDescriptionHint from './UploadDescriptionHint/UploadDescriptionHint';

const { Dragger } = Upload;

const UploadTabContent = (props) => {
  switch (props.fileType) {
    case 'upload':
    case 'upload-856-ext':
      const type = props.fileType === 'upload-856-ext' ? '856-ext' : props.type;  
      const uploadProps = {
        name: 'file',
        multiple: true,
        action: `/api/upload/${type}`,
        style: { width: 800 },
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

      return (
        <div>
          <UploadDescriptionHint type={props.type} />
          <Dragger {...uploadProps}>
            <p className='ant-upload-drag-icon'>
              <InboxOutlined />
            </p>
            <p className='ant-upload-text'>点击此处或拖拽Excel文件开始上传</p>
            <p className='ant-upload-text'>支持多文件上传</p>
          </Dragger>
        </div>
      );
    case 'archive':
    case 'archive-856-ext':
      return (
        <Table
          loading={props.tabLoading}
          dataSource={props.files}
          columns={props.fileColumns}
          rowSelection={props.tableRowSelection}
          size='middle'
        />
      );
  }

  return null;
};

/**
 * 文档上传组件.
 *
 * @param {Object} props
 *   组件参数.
 *
 * @return {React}
 */
const EdiUploadTab = (props) => {
  const is856 = props.type === '856';
  const isArchive = props.fileType === 'archive' || props.fileType === 'archive-856-ext';

  return (
    <React.Fragment>
      <Row style={{ marginBottom: 10 }} type="flex" align="bottom">
        <Col span={18}>
          <Row type="flex" align="bottom">
            <Col span={3}>
              {is856 && (
                <p style={{ marginBottom: 3 }}>
                  <b>856</b>
                </p>
              )}
              <Radio.Group value={props.fileType} onChange={(e) => props.filterOnchange(e.target.value, 'fileType')}>
                <Radio.Button value='upload'>上传</Radio.Button>
                <Radio.Button value='archive'>归档</Radio.Button>
              </Radio.Group>
            </Col>
            {is856 && (
              <Col span={3}>
                <p style={{ marginBottom: 3 }}>
                  <b>856 Ext</b>
                </p>
                <Radio.Group value={props.fileType} onChange={(e) => props.filterOnchange(e.target.value, 'fileType')}>
                  <Radio.Button value='upload-856-ext'>上传</Radio.Button>
                  <Radio.Button value='archive-856-ext'>归档</Radio.Button>
                </Radio.Group>
              </Col>
            )}
            {isArchive && (
              <EdiTableFilters
                sorting={props.sorting}
                keyword={props.keyword}
                onRefresh={props.onRefresh}
                filterOnchange={props.filterOnchange}
              />
            )}
          </Row>
        </Col>
        {isArchive && (
          <Col style={{ textAlign: 'right' }} span={6}>
            <Button onClick={props.bulkDownload} title='下载所选文件'>
              批量下载
            </Button>
            <Button style={{ marginLeft: 10 }} icon={<SyncOutlined />} onClick={props.onRefresh} title='刷新文件' />
          </Col>
        )}
      </Row>
      {<UploadTabContent {...props} />}
    </React.Fragment>
  );
};

export default EdiUploadTab;
