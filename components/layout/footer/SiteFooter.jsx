import { Layout } from 'antd';
import styles from './SiteFooter.module.scss';

const { Footer } = Layout;

export default () => {
	return <Footer className={ styles.footer }>Jointown EDI ©2020</Footer>;
}
