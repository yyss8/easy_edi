import { Layout } from 'antd';
import styles from './SiteFooter.module.scss';

const { Footer } = Layout;

/**
 * 站点全局footer组件.
 */
export default () => {
	return <Footer className={ styles.footer }>Easy EDI v1.8.3 ©2020</Footer>;
}
