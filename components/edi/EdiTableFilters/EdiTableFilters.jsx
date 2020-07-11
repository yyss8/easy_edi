import React from "react";
import {Col, Input, Select, DatePicker} from "antd";

const PoKeywordFilter = props => {
	return <Col offset={ 1 } span={ 4 }  >
		<Input.Search placeholder="搜索PO#" title="输入PO关键字" onSearch={props.onRefresh} value={ props.poKeyword } onChange={e => props.filterOnchange(e.target.value, 'poKeyword', false)} />
	</Col>
};

function getTypeFilters(props) {
	switch (props.type) {
		case '850':
			return <React.Fragment>
				<Col offset={ 1 } span={ 4 }>
					<DatePicker style={ {width: '100%'} } allowClear placeholder="筛选PO日期" value={props.poDate} onChange={date => props.filterOnchange(date, 'poDate')} format="YYYY-MM-DD" />
				</Col>
				<PoKeywordFilter {...props} />
			</React.Fragment>

		case '754':
			return <PoKeywordFilter {...props} />;

		default:
			return null;
	}
}


export default props => {
	return <React.Fragment>
		<Col span={ 4 }>
			<Select style={ {width: '100%'} } title="排序方式" value={props.sorting} onChange={ value => props.filterOnchange(value, 'sorting') }>
				<Select.Option value="created_DESC">创建时间 (新到旧)</Select.Option>
				<Select.Option value="created_ASC">创建时间 (旧到新)</Select.Option>
				<Select.Option value="modified_DESC">编辑时间 (新到旧)</Select.Option>
				<Select.Option value="modified_ASC">编辑时间 (旧到新)</Select.Option>
				<Select.Option value="name_ASC">文件名 (a-z)</Select.Option>
				<Select.Option value="name_DESC">文件名 (z-a)</Select.Option>
			</Select>
		</Col>
		<Col offset={ 1 } span={ 4 }>
			<Input.Search placeholder="搜索文件名" title="输入文件名关键字" onSearch={props.onRefresh} value={ props.keyword } onChange={e => props.filterOnchange(e.target.value, 'keyword', false)} />
		</Col>
		{ getTypeFilters(props) }
	</React.Fragment>;
}
