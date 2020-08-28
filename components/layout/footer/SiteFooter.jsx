import { Layout } from 'antd';
import styles from './SiteFooter.module.scss';

const { Footer } = Layout;

/**
 * 站点全局footer组件.
 */
const SiteFooter = () => {
  return <Footer className={styles.footer}>Easy EDI v2.0.2 ©2020</Footer>;
};

export default SiteFooter;
