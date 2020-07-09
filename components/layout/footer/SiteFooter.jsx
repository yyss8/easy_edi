import { Layout } from 'antd';
import styles from './SiteFooter.module.scss';

const { Footer } = Layout;

export default () => {
	return <Footer className={ styles.footer }>Easy EDI v1.1.0 ©2020</Footer>;
}
