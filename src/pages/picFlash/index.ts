import Lenis from '@studio-freight/lenis'

export const gridAnimationConfig = [
  {
    animationType: 'grid--1',
    sectionClassName: '',
    h3ClassName: 'content__title--right content__title--top',
  },
  {
    animationType: 'grid--2',
    sectionClassName: '',
    h3ClassName: '',
  },
  {
    animationType: 'grid--3',
    sectionClassName: 'content--spacing',
    h3ClassName: 'content__title--left content__title--bottom',
  },
  {
    animationType: 'grid--4',
    sectionClassName: 'content--spacing',
    h3ClassName: 'content__title--right',
  },
  {
    animationType: 'grid--5',
    sectionClassName: 'content--spacing',
    h3ClassName: '',
  },
  {
    animationType: 'grid--6',
    sectionClassName: 'content--spacing',
    h3ClassName: '',
  },
]

const initSmoothScrolling = () => {
  const lenis = new Lenis({
    lerp: 0.1, // 值越小平滑效果越明显
    smoothWheel: true, // 为鼠标滚轮事件启用平滑滚动
  })
  // 每次用户滚动时更新ScrollTrigger
  lenis.on('scroll', () => ScrollTrigger.update())
  // 每一帧动画执行
  const scrollFn = (time: number) => {
    lenis.raf(time) // lenis中requestAnimationFrame方法
    requestAnimationFrame(scrollFn) // 递归调用
  }
  // 启用动画帧
  requestAnimationFrame(scrollFn)
}
