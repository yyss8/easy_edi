import React from 'react';
import { Button, Col, Radio, Row, Table } from 'antd';
import { SyncOutlined } from '@ant-design/icons';

import EdiTableFilters from '../EdiTableFilters/EdiTableFilters';

/**
 * EDI下载列表tab组件.
 */
const EdiDownloadTab = (props) => {
  return (
    <React.Fragment>
      <Row style={{ marginBottom: 10 }}>
        <Col span={18}>
          <Row>
            <Col span={4}>
              <Radio.Group value={props.fileType} onChange={(e) => props.filterOnchange(e.target.value, 'fileType')}>
                <Radio.Button value='edi'>EDI</Radio.Button>
                <Radio.Button value='archive'>归档</Radio.Button>
              </Radio.Group>
            </Col>
            {<EdiTableFilters {...props} />}
          </Row>
        </Col>
        <Col style={{ textAlign: 'right' }} span={6}>
          <Button onClick={props.bulkDownload} title='下载所选文件'>
            批量下载
          </Button>
          {props.fileType === 'edi' && (
            <Button style={{ marginLeft: 10 }} onClick={props.bulkArchive} title='归档所选文件'>
              批量归档
            </Button>
          )}
          {props.fileType === 'archive' && (
            <Button style={{ marginLeft: 10 }} onClick={props.bulkDelete} type='danger' title='归档所选文件'>
              批量删除
            </Button>
          )}
          <Button style={{ marginLeft: 10 }} icon={<SyncOutlined />} onClick={props.onRefresh} title='刷新文件' />
        </Col>
      </Row>
      <Table
        expandable={{
          expandedRowRender: props.subTableRendered,
        }}
        loading={props.tabLoading}
        dataSource={props.files}
        columns={props.fileColumns}
        rowSelection={props.tableRowSelection}
        size='middle'
      />
    </React.Fragment>
  );
};

export default EdiDownloadTab;
