import classNames from 'lg-classnames';
import React, { FC, memo, useEffect, useState } from 'react';
import './index.less';

export interface IAddressPickerModel {
  code: string;
  fullName: string;
}
export interface IAddressPickerData {
  province: IAddressPickerModel;
  city: IAddressPickerModel;
  area: IAddressPickerModel;
}

type KeyType = keyof IAddressPickerData;

interface IProps {
  visible: boolean /** 是否显示 */;
  data?: IAddressPickerData | null /** 默认值 */;
  onFetch: (code: string) => Promise<any> /** 匹配数据源 */;
  onSure: (data: IAddressPickerData) => void /** 确认 */;
  onClose: () => void /** 关闭 */;
}

const AddressPicker: FC<IProps> = props => {
  // state
  const [selectedKey, setSelectedKey] = useState<KeyType>(
    'province',
  ); /** 选中字段标识 */
  const [items, setItems] = useState<IAddressPickerModel[]>(
    [] as IAddressPickerModel[],
  ); /** 列表数据 */
  const [innerData, setInnerData] = useState<IAddressPickerData>(() => {
    if (props.data) {
      return props.data;
    } else {
      return {
        province: { code: '', fullName: '' },
        city: { code: '', fullName: '' },
        area: { code: '', fullName: '' },
      };
    }
  }); /** 内部选中数据 */

  // methods
  /** 获取数据 */
  const getData = (code: string) => {
    props.onFetch(code).then((_items: IAddressPickerModel[]) => {
      setItems(_items);
    });
  };

  // events
  const onTap = (key: KeyType) => {
    setSelectedKey(key);
    setItems([]);
    let code = '';
    if (key === 'province') {
      setInnerData({
        province: { code: '', fullName: '' },
        city: { code: '', fullName: '' },
        area: { code: '', fullName: '' },
      });
    } else if (key === 'city') {
      code = innerData.province.code;
      setInnerData(prev => ({
        ...prev,
        city: { code: '', fullName: '' },
        area: { code: '', fullName: '' },
      }));
    } else if (key === 'area') {
      code = innerData.city.code;
      setInnerData(prev => ({
        ...prev,
        area: { code: '', fullName: '' },
      }));
    }
    getData(code);
  };

  const onItemTap = (item: IAddressPickerModel) => {
    setInnerData(prev => ({
      ...prev,
      [selectedKey]: { ...item },
    }));
    // 处理key值
    if (selectedKey === 'province') {
      setSelectedKey('city');
      getData(item.code);
    } else if (selectedKey === 'city') {
      setSelectedKey('area');
      getData(item.code);
    } else if (selectedKey === 'area') {
      setItems([]);
    }
  };
  const onInnerSure = () => {
    props.onSure({
      province: { ...innerData.province },
      city: { ...innerData.city },
      area: { ...innerData.area },
    });
    props.onClose();
  };
  // effects
  useEffect(() => {
    if (!innerData.province.code) {
      getData('');
    }
  }, []);

  // render
  return (
    <div
      className={classNames([
        'lg-address-picker',
        { visible: !!props.visible },
      ])}
    >
      <div className="lg-address-picker__contents">
        {/* 标题 */}
        <h3 className="lg-address-picker__title">已选择</h3>
        {/* 选择结果 */}
        <div className="lg-address-picker__res">
          {/* 省 */}
          <section
            className={classNames([
              'lg-address-picker__res_item',
              { selected: !!innerData.province.code },
            ])}
            onClick={() => {
              onTap('province');
            }}
          >
            {innerData.province.fullName || '选择省份'}
          </section>
          {/* 市 */}
          {innerData.province.fullName && (
            <section
              className={classNames([
                'lg-address-picker__res_item',
                { selected: !!innerData.city.code },
              ])}
              onClick={() => {
                onTap('city');
              }}
            >
              {innerData.city.fullName || '选择城市'}
            </section>
          )}
          {/* 区 */}
          {innerData.province.fullName && innerData.city.fullName && (
            <section
              className={classNames([
                'lg-address-picker__res_item',
                { selected: !!innerData.area.code },
              ])}
              onClick={() => {
                onTap('area');
              }}
            >
              {innerData.area.fullName || '选择城市'}
            </section>
          )}
        </div>
        {/* 选择项 */}
        <ul className="lg-address-picker__list">
          {items.map((item, i) => (
            <li
              key={`lg-address-picker__choose_${i}`}
              onClick={() => {
                onItemTap(item);
              }}
            >
              {item.fullName}
            </li>
          ))}
        </ul>
        {/* 确认按钮 */}
        <div className="lg-address-picker__button" onClick={onInnerSure}>
          确认
        </div>
        {/* 关闭按钮 */}
        <div className="lg-address-picker__close_btn" onClick={props.onClose} />
      </div>
    </div>
  );
};

export default memo(AddressPicker);
