<template>
  <view>
    <section key="1" :class="'content' + ''">
      <div class="grid">
        <div class="grid-wrap">
          <div class="grid__item" key="1">
            <img class="grid__item-inner" src="../../static/images/logo.jpg" />
          </div>
        </div>
      </div>
      <h3 :class="'content__title' + 'content__title--right content__title--top'">
        {'Fleeting moments,'} <br />
        {`existence's dance.`}
      </h3>
    </section>
  </view>
</template>

<script lang="ts" setup>
import { onMounted } from 'vue'
import Lenis from '@studio-freight/lenis'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { gsap } from 'gsap'

onMounted(() => {
  // initSmoothScrolling()

  loadImg()

  const query = uni.createSelectorQuery().in(null)

  // 选择 .grid 元素内的 .grid-item 元素
  query
    .selectAll('.grid')
    .boundingClientRect((rects) => {
      if (rects) {
        console.log('获取到的 .grid-item 元素信息：', rects)
        // 这里可以对获取到的元素信息进行进一步处理
      } else {
        console.log('未找到 .grid-item 元素')
      }
    })
    .exec()
  // Array.from(grids).map((grid, i) => chooseAnimation(`grid--${i + 1}`, grid))
})

type ModuleImage = {
  default: string
}

const loadImg = () => {
  let imagePaths: string[] = (
    Object.values(import.meta.glob('../../static/images/*.jpg', { eager: true })) as ModuleImage[]
  ).map((item: ModuleImage) => {
    return item.default
  })

  return Promise.all(
    imagePaths.map((url: string) => {
      return new Promise((resolve, reject) => {
        // let image = new Image()
        // image.src = url
        // image.onload = () => {
        //   resolve(image)
        // }
        // image.onerror = (e) => {
        //   reject(new Error('加载图片错误：' + e))
        // }

        uni.getImageInfo({
          src: url,
          success: (res) => {
            resolve(res)
          },
          fail: (err) => {
            console.log('获取图片信息失败：', err)
          },
        })
      })
    }),
  )
}

const chooseAnimation = (animationType: string, grid: Element) => {
  console.log('grid')
  console.log(grid)
  const query = uni.createSelectorQuery()
  console.log(query.select('.grid').node)

  // const gridWrap = grid.querySelector('.grid-wrap')
  const gridWrap = query.select('.grid').node
  const gridItems: any = grid.querySelectorAll('.grid__item')
  const gridItemsInner = [...gridItems].map((item) => item.querySelector('.grid__item-inner'))
  const timeline = gsap.timeline({
    defaults: { ease: 'none' }, //默认的缓动函数为"none"
    scrollTrigger: {
      trigger: gridWrap, //配置ScrollTrigger触发器，指定了何时触发动画，包括滚动触发的范围。
      start: 'top bottom+=5%',
      end: 'bottom top-=5%',
      scrub: true,
    },
  })
}

// 定义类型：GridSubset 获取子集时的参数类型
type GridSubset = 'even' | 'odd' | null

// 定义返回的 Grid 对象接口
interface Grid {
  refresh: () => void // 刷新元素的边界信息
  columns: (alternating?: GridSubset, merge?: boolean) => Element[] | Element[][]
  rows: (alternating?: GridSubset, merge?: boolean) => Element[] | Element[][]
  [index: number]: Element // 支持通过索引访问
}

const getGrid = (selector: NodeListOf<Element>): Grid => {
  // 使用 gsap.utils.toArray 将 NodeList 转换为数组
  const elements: Element[] = gsap.utils.toArray(selector)
  let bounds: DOMRect[] // 存储每个元素的边界信息 (getBoundingClientRect)

  /**
   * 获取行或列的子集
   * @param axis 指定轴（'left' 表示列, 'top' 表示行）
   * @param dimension 对应的宽度或高度 ('width' 或 'height')
   * @param alternating 是否获取偶数或奇数项（'even' 或 'odd'），否则为 null
   * @param merge 是否将子集合并为一个平铺数组
   * @returns 返回筛选后的子集数组（可以是二维数组或一维数组）
   */
  const getSubset = (
    axis: 'left' | 'top',
    dimension: 'width' | 'height',
    alternating: GridSubset = null,
    merge: boolean = false,
  ): Element[] | Element[][] => {
    let a: Element[][] = [] // 存储子集数组
    const subsets: Record<number, Element[]> = {} // 根据位置分组的子集
    const onlyEven = alternating === 'even' // 判断是否仅获取偶数项
    let p: string // 用于遍历 subsets 的键

    // 遍历每个元素的边界
    bounds.forEach((b, i) => {
      const position = Math.round(b[axis] + b[dimension] / 2) // 计算中心点位置
      let subset = subsets[position] // 获取该位置的子集
      if (!subset) subsets[position] = subset = [] // 初始化子集
      subset.push(elements[i]) // 将当前元素加入子集
    })

    // 将 subsets 转换为数组形式
    for (p in subsets) {
      a.push(subsets[p])
    }

    // 筛选偶数或奇数子集
    if (onlyEven || alternating === 'odd') {
      a = a.filter((_, i) => !(i % 2) === onlyEven)
    }

    // 如果需要合并，将二维数组转换为一维数组
    if (merge) {
      const merged: Element[] = []
      a.forEach((subset) => merged.push(...subset))
      return merged
    }

    return a
  }

  /**
   * 刷新元素的边界信息
   */
  const refresh = (): void => {
    bounds = elements.map((el) => el.getBoundingClientRect())
  }

  // 初始化边界信息
  refresh()

  // 返回的 Grid 对象，包含额外的方法
  return Object.assign(elements, {
    refresh,
    columns: (alternating?: GridSubset, merge: boolean = false) =>
      getSubset('left', 'width', alternating, merge),
    rows: (alternating?: GridSubset, merge: boolean = false) =>
      getSubset('top', 'height', alternating, merge),
  })
}
</script>

<style lang="scss" scoped>
main {
  position: relative;
  overflow: hidden;
  width: 100%;
}

.intro {
  height: calc(100vh - 3rem);
  text-align: center;
  place-items: center;
  display: grid;
  margin-bottom: 30vh;
  .intro__title {
    place-items: center;
    margin: 0;
    line-height: 0.9;
    display: grid;
    margin-top: 15vh;
    font-weight: 400;
    .intro__title-pre {
      font-size: clamp(2rem, 8vw, 5rem);
      color: var(--color-title);
      text-transform: uppercase;
    }
    .intro__title-sub {
      font-size: clamp(1.5rem, 20vw, 8rem); /* 分别是最小值、首选值和最大值 */
      max-width: 15ch;
      margin: 0 auto;
    }
  }
  .intro__info {
    max-width: 20ch;
    opacity: 0.6;
    margin-bottom: 4rem;
    padding-bottom: 1rem;
    line-height: 1.2;
    align-self: end;
  }
}

.content {
  position: relative;
  margin-bottom: 20vh;
  .grid {
    display: grid;
    place-items: center;
    padding: 2rem;
    width: 100%;
    perspective: var(--perspective);
  }
  .grid-wrap {
    height: var(--grid-height);
    width: var(--grid-width);
    display: grid;
    grid-template-columns: repeat(var(--grid-columns), 1fr);
    gap: var(--grid-gap);
    transform-style: preserve-3d;
    .grid__item {
      aspect-ratio: var(--grid-item-ratio);
      width: 100%;
      height: auto;
      overflow: hidden;
      position: relative;
      border-radius: 8px;
      display: grid;
      place-items: center;
      .grid__item-inner {
        position: relative;
        width: calc(1 / var(--grid-inner-scale) * 100%);
        height: calc(1 / var(--grid-inner-scale) * 100%);
        background-size: cover;
        background-position: 50% 50%;
      }
    }
  }
  .content__title {
    position: absolute;
    height: 100vh;
    width: 100vw;
    top: 50%;
    left: 50%;
    margin: -50vh 0 0 -50vw;
    padding: 0 10vw;
    display: grid;
    place-items: center;
    text-align: center;
    font-weight: 300;
    font-size: clamp(1.5rem, 15vw, 6.5rem);
  }
  .content__title--top {
    align-items: start;
  }
  .content__title--bottom {
    align-items: end;
  }
  .content__title--left {
    justify-items: start;
    text-align: left;
  }
  .content__title--right {
    justify-items: end;
    text-align: right;
  }
}
.content--spacing {
  margin-bottom: 80vh;
}
</style>
