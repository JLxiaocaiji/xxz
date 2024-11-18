<template>
  <view
    >111
    <view id="app">
      <canvas
        class="webgl"
        type="webgl"
        id="gl"
        @touchstart="onTX"
        @touchmove="onTX"
        @touchend="onTX"
      ></canvas>
    </view>
  </view>
</template>

<script lang="ts" setup>
import * as THREE from 'three-platformize'
import { onLoad, onReady } from '@dcloudio/uni-app'
import { getCurrentInstance, ref } from 'vue'
import { WechatPlatform } from 'three-platformize/src/WechatPlatform'

const canvas = ref<Object>({
  width: 300,
  height: 500,
})

onReady(() => {
  uni
    .createSelectorQuery()
    .in(getCurrentInstance())
    .select('#gl')
    .fields(
      {
        id: true,
        dataset: true,
        rect: true,
        size: true,
        scrollOffset: true,
        context: true,
      },
      (res) => {
        console.log(res)
        console.log(1111)
      },
    )
    .exec((res) => {
      console.log(res)
    })

  init()
})

const init = () => {
  let obj = uni.createSelectorQuery().in(getCurrentInstance()).select('#gl')
  console.log('a')
  console.log(obj)
  console.log(canvas.value)

  const canvasNode = obj.node
  const platform = new WechatPlatform(canvasNode) // webgl canvasNode
  platform.enableDeviceOrientation('game')
  THREE.PLATFORM.set(platform)

  show()
}

const show = () => {
  const scene = new THREE.Scene()
  const camera = new THREE.PerspectiveCamera(
    75,
    canvas.value.width / canvas.value.height,
    0.1,
    1000,
  )
  camera.position.set(0, 0, 10)
  const sphereGeometry = new THREE.SphereGeometry(1, 20, 20)
  const material = new THREE.MeshStandardMaterial({
    side: THREE.DoubleSide,
  })
  const sphere = new THREE.Mesh(sphereGeometry, material)
  sphere.castShadow = true
  scene.add(sphere)

  const planeGeometry = new THREE.PlaneGeometry(50, 50)
  const plane = new THREE.Mesh(planeGeometry, material)
  plane.position.set(0, -1, 0)
  plane.rotation.x = -Math.PI / 2
  plane.receiveShadow = true
  scene.add(plane)

  const light = new THREE.AmbientLight(0xffffff, 0.5)
  scene.add(light)

  const spotLight = new THREE.SpotLight(0xffffff, 1)
  spotLight.position.set(5, 5, 5)
  spotLight.castShadow = true
  spotLight.intensity = 2
  spotLight.shadow.radius = 20
  spotLight.shadow.mapSize.set(512, 512)
  spotLight.target = sphere
  spotLight.angle = Math.PI / 6
  const renderer = new THREE.WebGLRenderer()
  renderer.setSize(canvas.value.width, canvas.value.height)
  renderer.shadowMap.enabled = true

  const render = () => {
    camera.updateMatrix()
    renderer.render(scene, camera)
    requestAnimationFrame(render)
  }
}

// const canvas = res[0].node;
// const platform = new WechatPlatform(canvas); // webgl canvas
// platform.enableDeviceOrientation('game'); // 开启DeviceOrientation
// THREE.PLATFORM.set(platform);
// this.platform = platform;

// var scene = new THREE.Scene();
// var camera = new THREE.PerspectiveCamera(75, canvas.width / canvas.height, 0.1, 1000);
// camera.position.set(0, 0, 10);
// scene.add(camera);
// const geometry = new THREE.BoxGeometry(1, 1, 1);
// const materials = new THREE.MeshBasicMaterial();
// const cube = new THREE.Mesh(geometry, materials);
// scene.add(cube);
// const light = new THREE.AmbientLight(0xffffff);
// scene.add(light);
// //注意,这里必须要添加一个{ canvas: canvas },不然会报createElementNS错误
// const renderer = new THREE.WebGLRenderer({ canvas: canvas });
// renderer.setSize(canvas.width, canvas.height);
// const controls = new OrbitControls(camera, renderer.domElement);
</script>

<style lang="scss" scoped></style>
