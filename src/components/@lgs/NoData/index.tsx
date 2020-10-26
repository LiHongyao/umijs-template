import React, { memo } from 'react'
import './index.scss'

interface IProps {
  tips?: string
}
const NoData: React.FC<IProps> = props => {
  const { tips } = props;
  return (
    <div className="lg-no-data">
      <img className="lg-no-data__img" src={require('./images/no-data.png')} alt=""/>
      {tips && <p className="lg-no-data__tips">{tips}</p>}
    </div>
  )
}

export default memo(NoData);
