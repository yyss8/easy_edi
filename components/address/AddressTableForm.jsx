import {Button, Form, Input, Table} from "antd";
import {MinusCircleOutlined} from "@ant-design/icons";
import styles from './AddressTableForm.module.scss';

export default props => {
	const addressColumns = [
		{
			title: '描述',
			key: 'address_title',
			render: (text, record, index) => {
				return <Form.Item rules={[{ required: true }]} name={[index, 'address_title']}>
					<Input size="small" placeholder="描述" />
				</Form.Item>
			}
		},
		{
			title: 'Code',
			key: 'address_code',
			render: (text, record, index) => {
				return <Form.Item name={[index, 'address_code']}>
					<Input size="small" placeholder="Code" />
				</Form.Item>
			}
		},
		{
			title: props.type === 'from' ? 'Sender' : 'Receiver',
			key: 'owner',
			render: (text, record, index) => {
				return <Form.Item name={[index, 'address_owner']}>
					<Input size="small" placeholder={ props.type === 'from' ? 'Sender' : 'Receiver' } />
				</Form.Item>
			}
		},
		{
			title: 'Street',
			key: 'address_street',
			render: (text, record, index) => {
				return <Form.Item name={[index, 'address_street']}>
					<Input size="small" placeholder="Street" />
				</Form.Item>
			}
		},
		{
			title: 'City',
			key: 'address_city',
			render: (text, record, index) => {
				return <Form.Item name={[index, 'address_city']}>
					<Input size="small" placeholder="City" />
				</Form.Item>
			},
		},
		{
			title: 'State',
			key: 'address_state',
			render: (text, record, index) => {
				return <Form.Item name={[index, 'address_state']}>
					<Input size="small" placeholder="State/Province"  />
				</Form.Item>
			},
		},
		{
			title: 'Zip Code',
			key: 'address_zip',
			render: (text, record, index) => {
				return <Form.Item name={[index, 'address_zip']}>
					<Input size="small" placeholder="Zip Code"  />
				</Form.Item>
			},
		},
		{
			title: 'Country',
			key: 'address_country',
			render: (text, record, index) => {
				return <Form.Item name={[index, 'address_country']}>
					<Input size="small" placeholder="Country" />
				</Form.Item>
			},
		},
		{
			title: '',
			key: 'action',
			render: (text, record) => <span>
				<Button size="small" icon={ <MinusCircleOutlined/> } title="删除" onClick={ () => props.actions.remove(record.name) } />
			</span>
		},
	];

	return <Table loading={ props.isLoading }  className={ styles['address-form'] } dataSource={ props.fields } columns={ addressColumns } />
}
