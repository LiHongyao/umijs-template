import React, { useState, useEffect, useRef, useImperativeHandle } from 'react';

import { usePullDown, usePullUp } from './hooks';

import BScroll from '@better-scroll/core';
import Pullup from '@better-scroll/pull-up';
import PullDown from '@better-scroll/pull-down';

import LoadMore from './LoadMore';
import PullRefresh from './PullRefresh';

import './index.less';

export enum kPullDownStatus {
  REFRESH = 'REFRESH',
  LOADING = 'LOADING',
  DONE = 'DONE',
  MORE = 'MORE',
  NO_MORE = 'NO_MORE',
}

export enum kPullUpStatus {
  INITIAL = 'INITIAL',
  MORE = 'MORE',
  NO_MORE = 'NO_MORE',
  LOADING = 'LOADING',
  LOADED = 'LOADED',
}

export enum kPullType {
  REFRESH = 'REFRESH',
  LOAD_MORE = 'LOAD_MORE',
}

BScroll.use(Pullup).use(PullDown);

interface IProps {
  children: JSX.Element | JSX.Element[];
  height?: number;
  onScroll?: (data: any) => void;
  onPullUp?: () => void;
  pullUpStatus?: kPullUpStatus;
  onPullDown?: () => void;
  pullDownStatus?: kPullDownStatus;
}

export interface IScrollRefs {
  refresh: () => void /** 刷新bScroll */;
  scrollTo: (x: number, y: number, time?: number) => void /** 滚动到指定位置 */;
}

const Scroll = React.forwardRef<IScrollRefs, IProps>((props, ref) => {
  const {
    children,
    height = document.querySelector('body')?.getBoundingClientRect().height,
    pullUpStatus,
    pullDownStatus,
    onScroll,
    onPullUp,
    onPullDown,
  } = props;

  // refs
  const lgScrollRef = useRef<HTMLDivElement>(null);

  // states
  const [bScroll, setBScroll] = useState<BScroll | null>(null);

  // initialize
  useEffect(() => {
    const node = lgScrollRef.current;
    if (node) {
      const scroll = new BScroll(node, {
        scrollY: true,
        probeType: 3, // 实时派发scroll事件
        bounce: {
          top: true,
          right: false,
          bottom: false,
          left: false,
        },
        pullUpLoad: true,
        pullDownRefresh: onPullDown
          ? {
              threshold: 90,
              stop: 80,
            }
          : undefined,
        click: true,
      });
      setBScroll(scroll);
      return () => {
        setBScroll(null);
      };
    }
  }, []);

  // => 滚动
  useEffect(() => {
    if (!bScroll || !onScroll) return;
    bScroll.on('scroll', onScroll);
    return () => {
      bScroll.off('scroll', onScroll);
    };
  }, [bScroll, onScroll]);

  // => 上拉加载更多
  useEffect(() => {
    if (!bScroll || !onPullUp) return;
    bScroll.on('pullingUp', onPullUp);
    bScroll.finishPullUp();
    return () => {
      bScroll.off('pullingUp', onPullUp);
    };
  }, [bScroll, onPullUp]);

  // =>下拉刷新
  useEffect(() => {
    if (!bScroll || !onPullDown) return;
    bScroll.on('pullingDown', onPullDown);
    return () => {
      bScroll.off('pullingDown', onPullDown);
    };
  }, [bScroll, onPullDown]);

  // 监听 - 上拉状态变化
  useEffect(() => {
    if (
      bScroll &&
      (pullUpStatus === kPullUpStatus.MORE ||
        pullUpStatus === kPullUpStatus.NO_MORE)
    ) {
      const _timer = setTimeout(() => {
        bScroll.finishPullUp();
        bScroll.refresh();
        clearTimeout(_timer);
      }, 300);
    }
  }, [bScroll, pullUpStatus]);
  // 监听 - 下拉状态变化
  useEffect(() => {
    if (bScroll && pullDownStatus === kPullDownStatus.DONE) {
      const _timer = setTimeout(() => {
        bScroll.finishPullDown();
        bScroll.refresh();
        clearTimeout(_timer);
      }, 300);
    }
  }, [bScroll, pullDownStatus]);

  // 监听高度变化
  useEffect(() => {
    if (bScroll) {
      bScroll.refresh();
    }
  }, [bScroll, height, children]);

  useImperativeHandle(
    ref,
    () => ({
      refresh: () => {
        bScroll?.refresh();
      },
      scrollTo: (x: number, y: number, time?: number) => {
        bScroll?.scrollTo(x, y, time);
      },
    }),
    [bScroll],
  );

  return (
    <div
      className="lg-scroll"
      style={height ? { height: height + 'px' } : {}}
      ref={lgScrollRef}
    >
      {/* 滚动内容 */}
      <div
        className="lhy-scroll__content"
        style={height ? { minHeight: height + 1 + 'px' } : {}}
      >
        {/* 下拉刷新 */}
        {onPullDown && <PullRefresh status={pullDownStatus} />}
        {/* 滚动内容 */}
        {props.children}
        {/* 上拉加载 */}
        {onPullUp && (
          <LoadMore visible={!!pullUpStatus} status={pullUpStatus} />
        )}
      </div>
    </div>
  );
});

export { usePullDown, usePullUp };

export default Scroll;
