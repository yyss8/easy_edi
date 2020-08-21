import React, { Component } from 'react';
import { Row, Input, Space, Button, message } from 'antd';
import { EyeInvisibleOutlined, EyeTwoTone } from '@ant-design/icons';

/**
 * 登录组件.
 */
export default class extends Component {
  /** @inheritdoc */
  constructor(props) {
    super(props);

    this.state = {
      user: '',
      pass: '',
    };
  }

  /**
   * 处理登录框回车登录.
   *
   * @param {Event} e
   */
  handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      this.onLogin();
    }
  };

  /**
   * 处理登录.
   */
  onLogin() {
    if (this.state.user === 'user' && this.state.pass === '123456') {
      this.props.userOnchange(this.state.user);
      return;
    }

    message.error('账号或密码错误.');
  }

  /** @inheritdoc */
  render() {
    return (
      <Row className='login-view' justify='center' align='middle'>
        <Space direction='vertical'>
          <Input
            onKeyDown={this.handleKeyDown.bind(this)}
            value={this.state.user}
            onChange={(e) => this.setState({ user: e.target.value })}
            placeholder='输入账号'
          />
          <Input.Password
            onKeyDown={this.handleKeyDown.bind(this)}
            value={this.state.pass}
            onChange={(e) => this.setState({ pass: e.target.value })}
            placeholder='输入密码'
            iconRender={(visible) => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
          />
          <Button title='点击登录EDI工具' onClick={this.onLogin.bind(this)} style={{ width: '100%' }}>
            登录EDI工具
          </Button>
        </Space>
      </Row>
    );
  }
}
