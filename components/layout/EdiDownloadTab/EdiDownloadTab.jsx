import {Button, Col, Radio, Row, Table} from "antd";
import {SyncOutlined} from "@ant-design/icons";
import React from "react";
import EdiTableFilters from "../EdiTableFilters/EdiTableFilters";

export default props => {
	return <React.Fragment>
		<Row style={{marginBottom: 10}}>
			<Col span={ 18 }>
				<Row>
					<Col span={ 4 }>
						<Radio.Group value={props.fileType} onChange={ e => props.filterOnchange(e.target.value, 'fileType') }>
							<Radio.Button value="edi">EDI</Radio.Button>
							<Radio.Button value="archive">归档</Radio.Button>
						</Radio.Group>
					</Col>
					{ <EdiTableFilters sorting={props.sorting} keyword={props.keyword} onRefresh={props.onRefresh} filterOnchange={props.filterOnchange} /> }
				</Row>
			</Col>
			<Col style={{textAlign: 'right'}} span={ 6 }>
				<Button icon={ <SyncOutlined /> } onClick={props.onRefresh} title="刷新文件" />
			</Col>
		</Row>
		<Table loading={props.tabLoading} dataSource={props.files} columns={props.fileColumns} />
	</React.Fragment>;
};
