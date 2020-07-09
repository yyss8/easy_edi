import React from "react";

export default props => {
	switch (props.type) {
		case 'label-excel':
			return <h3>成功上传标签后请等待2-3秒然后到<a href="/?type=label">已生成标签</a>查看生成结果.</h3>;

		case '856':
		case '753':
		default:
			return <h3>请至亚马逊Operational Analytics页面查看发送结果或查看<a href="/?type=997">发送回执</a>或<a href="/?type=error">错误信息</a>.</h3>;
	}
}
