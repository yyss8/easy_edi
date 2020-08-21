import React from 'react';
import { Layout, Row } from 'antd';
import Link from 'next/link';
import HeaderStyles from './SiteHeader.module.scss';

/**
 * 站点全局header组件.
 */
export default (props) => {
  return (
    <Layout.Header className={HeaderStyles.header}>
      <Row type='flex' justify='space-between' align='middle'>
        <h1 style={{ color: '#CDD2D4', marginBottom: 0 }}>
          <a href='/'>Easy EDI</a>
        </h1>
        {props.isLoggedIn && (
          <div className='actions'>
            <Link href='/'>
              <a>文档管理</a>
            </Link>
            <Link href='/cp/addresses'>
              <a>列表管理</a>
            </Link>
            <Link href='/cp/products'>
              <a>商品管理</a>
            </Link>
            <a title='注销账户' size='small' onClick={() => props.userOnchange(null)}>
              注销
            </a>
          </div>
        )}
      </Row>
    </Layout.Header>
  );
};
