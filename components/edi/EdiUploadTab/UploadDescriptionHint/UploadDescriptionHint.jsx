import React from 'react';

/**
 * 上传描述组件.
 *
 * 根据不同文档类型返回不同描述.
 *
 * @param {Object} props
 *   组件参数.
 *
 * @return {React}
 */
const UploadDescriptionHint = (props) => {
  switch (props.type) {
    case 'label-excel':
      return (
        <React.Fragment>
          <h3>
            通过<a href="/?type=754">ARN确认</a>文件可生成并提交标签生成文档<br />
            成功上传标签后请等待2-3秒然后到<a href='/?type=label'>已生成标签</a>查看生成结果.
          </h3>
          <h5>上传文件名请勿带有#符号, 否则将无法下载归档文件.</h5>
        </React.Fragment>
      );

    case '856':
      return (
        <React.Fragment>
          <h3>
            通过<a href="/?type=label-excel&fileType=archive">上传标签归档</a>文件可生成并提交发货通知<br />
            上传或提交完成后至亚马逊Operational Analytics页面查看发送结果或查看<a href='/?type=notify'>网关通知</a>.
          </h3>
          <h5>1. 如果第一次发送错误, 没有生成ASN, 文件名加-force重新上传.</h5>
          <h5>2. 上传文件名请勿带有#符号, 否则将无法下载归档文件.</h5>
        </React.Fragment>
      );

    case '855':
      return (
        <React.Fragment>
          <h3>
            通过<a href="/">订单信息</a>文件可生成并提交订单确认文档<br />
            上传或提交完成后至亚马逊Operational Analytics页面查看发送结果或查看<a href='/?type=notify'>网关通知</a>.
          </h3>
          <h5>上传文件名请勿带有#符号, 否则将无法下载归档文件.</h5>
        </React.Fragment>
      );

    case '810':
      return (
        <React.Fragment>
          <h3>
            通过<a href="/?type=855&fileType=archive">订单确认</a>文件可生成并提交发票文档<br />
            上传或提交完成后至亚马逊Operational Analytics页面查看发送结果或查看<a href='/?type=notify'>网关通知</a>.
          </h3>
          <h5>上传文件名请勿带有#符号, 否则将无法下载归档文件.</h5>
        </React.Fragment>
      );

    case '753':
      return (
        <React.Fragment>
          <h3>
            通过<a href="/">订单信息</a>文件可生成并提交ARN申请文档<br />
            上传或提交完成后至亚马逊Operational Analytics页面查看发送结果或查看<a href='/?type=notify'>网关通知</a>.
          </h3>
          <h5>上传文件名请勿带有#符号, 否则将无法下载归档文件.</h5>
        </React.Fragment>
      );

    default:
      return (
        <React.Fragment>
          <h3>
            通过<a href="/">订单信息</a>文件可生成并提交ARN申请文档<br />
            上传或提交完成后至亚马逊Operational Analytics页面查看发送结果或查看<a href='/?type=notify'>网关通知</a>.
          </h3>
          <h5>上传文件名请勿带有#符号, 否则将无法下载归档文件.</h5>
        </React.Fragment>
      );
  }
};

export default UploadDescriptionHint;
