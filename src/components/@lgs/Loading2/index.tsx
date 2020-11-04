import React, { FC, memo } from 'react';
import './index.less';

interface IProps {
  showTips?: boolean;
  tips?: string;
  top?: string;
}
const Loading2: FC<IProps> = ({
  top = '100px',
  tips = '数据加载中...',
  showTips = true,
}) => {
  return (
    <div className="lg-loading2" style={{ paddingTop: top }}>
      <div className="lg-loading2__ct">
        <div className="lg-loading2__icon"></div>
      </div>
      {showTips && <div className="lg-loading2__tips">{tips}</div>}
    </div>
  );
};

export default memo(Loading2);
