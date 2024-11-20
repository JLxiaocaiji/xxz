import * as THREE from 'three-platformize'

const BAS: any = {}

BAS.ShaderChunk = {}

BAS.ShaderChunk['animation_time'] =
  'float tDelay = aAnimation.x;\nfloat tDuration = aAnimation.y;\nfloat tTime = clamp(uTime - tDelay, 0.0, tDuration);\nfloat tProgress = ease(tTime, 0.0, 1.0, tDuration);\n'

BAS.ShaderChunk['catmull-rom'] =
  'vec3 catmullRom(vec3 p0, vec3 p1, vec3 p2, vec3 p3, float t)\n{\n    vec3 v0 = (p2 - p0) * 0.5;\n    vec3 v1 = (p3 - p1) * 0.5;\n    float t2 = t * t;\n    float t3 = t * t * t;\n\n    return vec3((2.0 * p1 - 2.0 * p2 + v0 + v1) * t3 + (-3.0 * p1 + 3.0 * p2 - 2.0 * v0 - v1) * t2 + v0 * t + p1);\n}\n\nvec3 catmullRom(vec3 p0, vec3 p1, vec3 p2, vec3 p3, vec2 c, float t)\n{\n    vec3 v0 = (p2 - p0) * c.x;\n    vec3 v1 = (p3 - p1) * c.y;\n    float t2 = t * t;\n    float t3 = t * t * t;\n\n    return vec3((2.0 * p1 - 2.0 * p2 + v0 + v1) * t3 + (-3.0 * p1 + 3.0 * p2 - 2.0 * v0 - v1) * t2 + v0 * t + p1);\n}\n\nfloat catmullRom(float p0, float p1, float p2, float p3, float t)\n{\n    float v0 = (p2 - p0) * 0.5;\n    float v1 = (p3 - p1) * 0.5;\n    float t2 = t * t;\n    float t3 = t * t * t;\n\n    return float((2.0 * p1 - 2.0 * p2 + v0 + v1) * t3 + (-3.0 * p1 + 3.0 * p2 - 2.0 * v0 - v1) * t2 + v0 * t + p1);\n}\n\nfloat catmullRom(float p0, float p1, float p2, float p3, vec2 c, float t)\n{\n    float v0 = (p2 - p0) * c.x;\n    float v1 = (p3 - p1) * c.y;\n    float t2 = t * t;\n    float t3 = t * t * t;\n\n    return float((2.0 * p1 - 2.0 * p2 + v0 + v1) * t3 + (-3.0 * p1 + 3.0 * p2 - 2.0 * v0 - v1) * t2 + v0 * t + p1);\n}\n'

BAS.ShaderChunk['cubic_bezier'] =
  'vec3 cubicBezier(vec3 p0, vec3 c0, vec3 c1, vec3 p1, float t)\n{\n    vec3 tp;\n    float tn = 1.0 - t;\n\n    tp.xyz = tn * tn * tn * p0.xyz + 3.0 * tn * tn * t * c0.xyz + 3.0 * tn * t * t * c1.xyz + t * t * t * p1.xyz;\n\n    return tp;\n}\n'

BAS.ShaderChunk['ease_in_cubic'] =
  'float ease(float t, float b, float c, float d) {\n  return c*(t/=d)*t*t + b;\n}\n'

BAS.ShaderChunk['ease_in_out_cubic'] =
  'float ease(float t, float b, float c, float d) {\n  if ((t/=d/2.0) < 1.0) return c/2.0*t*t*t + b;\n  return c/2.0*((t-=2.0)*t*t + 2.0) + b;\n}\n'

BAS.ShaderChunk['ease_in_quad'] =
  'float ease(float t, float b, float c, float d) {\n  return c*(t/=d)*t + b;\n}\n'

BAS.ShaderChunk['ease_out_back'] =
  'float ease(float t, float b, float c, float d) {\n  float s = 1.70158;\n  return c*((t=t/d-1.0)*t*((s+1.0)*t + s) + 1.0) + b;\n}\n\nfloat ease(float t, float b, float c, float d, float s) {\n  return c*((t=t/d-1.0)*t*((s+1.0)*t + s) + 1.0) + b;\n}\n'

BAS.ShaderChunk['ease_out_cubic'] =
  'float ease(float t, float b, float c, float d) {\n  return c*((t=t/d - 1.0)*t*t + 1.0) + b;\n}\n'

BAS.ShaderChunk['quaternion_rotation'] =
  'vec3 rotateVector(vec4 q, vec3 v)\n{\n    return v + 2.0 * cross(q.xyz, cross(q.xyz, v) + q.w * v);\n}\n\nvec4 quatFromAxisAngle(vec3 axis, float angle)\n{\n    float halfAngle = angle * 0.5;\n    return vec4(axis.xyz * sin(halfAngle), cos(halfAngle));\n}\n'

BAS.Utils = {
  /**
   * 将一个几何体的面分离成单独的顶点，并将这些顶点存储在一个新的数组中，同时更新原始几何体的面索引，以便它们现在引用新的分离顶点数组
   * @param {几何体} geometry
   */
  separateFaces: function (geometry: THREE.BufferGeometry): void {
    // 获取顶点和索引数据
    const positions = geometry.attributes.position.array as Float32Array
    const indices = geometry.index ? geometry.index.array : undefined

    // 如果没有索引（即没有面），则不进行任何操作
    if (!indices) {
      console.warn('BufferGeometry does not have indices.')
      return
    }

    // vertices 空数组，存储分离出来的顶点
    const vertices: Float32Array[] = []
    const newIndices: number[] = []

    // 遍历索引数组中的每一组顶点索引
    for (let i = 0; i < indices.length; i += 3) {
      // 每次从 indices 中获取一个面
      const a = indices[i]
      const b = indices[i + 1]
      const c = indices[i + 2]

      // 计算每个顶点的位置
      const va = new THREE.Vector3(positions[a * 3], positions[a * 3 + 1], positions[a * 3 + 2])
      const vb = new THREE.Vector3(positions[b * 3], positions[b * 3 + 1], positions[b * 3 + 2])
      const vc = new THREE.Vector3(positions[c * 3], positions[c * 3 + 1], positions[c * 3 + 2])

      // 将顶点添加到新数组中
      const startIndex = vertices.length

      vertices.push(new Float32Array(va.toArray()))
      vertices.push(new Float32Array(vb.toArray()))
      vertices.push(new Float32Array(vc.toArray()))

      // 更新新索引数组，引用新的顶点
      newIndices.push(startIndex, startIndex + 1, startIndex + 2)
    }

    // 更新 BufferGeometry 的属性
    const newPositions = new Float32Array(vertices.length * 3)
    vertices.forEach((vertex, index) => {
      newPositions.set(vertex, index * 3)
    })

    // 设置新的顶点位置属性
    geometry.setAttribute('position', new THREE.BufferAttribute(newPositions, 3))

    // 如果原始几何体有索引，则更新为新的索引
    if (geometry.index) {
      geometry.setIndex(newIndices)
    }

    // 删除原始几何体上的 __tmpVertices 属性，如果它存在的话
    // geometry.__tmpVertices ? delete geometry.__tmpVertices : ""
  },

  /**
   * 对一个几何体进行细分，以生成更小的三角形
   * @param {几何体} geometry
   * @param {最大边长} maxEdgeLength
   */
  tessellate: function (geometry: THREE.BufferGeometry, maxEdgeLength: number): void {
    const positions = geometry.attributes.position.array as Float32Array
    const indices = geometry.index ? geometry.index.array : undefined
    const maxEdgeLengthSquared = maxEdgeLength * maxEdgeLength

    // 存储细分后的面和UV
    const newIndices: number[] = []
    const newPositions: number[] = []
    const newUVs: number[] = []

    if (!indices) {
      console.warn('BufferGeometry does not have indices.')
      return
    }

    // 获取 UV 数据
    const uvAttribute = geometry.attributes.uv
    const uvs = uvAttribute ? uvAttribute.array : undefined

    // 遍历所有的三角形面
    for (let i = 0; i < indices.length; i += 3) {
      const aIdx = indices[i]
      const bIdx = indices[i + 1]
      const cIdx = indices[i + 2]

      const va = new THREE.Vector3(
        positions[aIdx * 3],
        positions[aIdx * 3 + 1],
        positions[aIdx * 3 + 2],
      )
      const vb = new THREE.Vector3(
        positions[bIdx * 3],
        positions[bIdx * 3 + 1],
        positions[bIdx * 3 + 2],
      )
      const vc = new THREE.Vector3(
        positions[cIdx * 3],
        positions[cIdx * 3 + 1],
        positions[cIdx * 3 + 2],
      )

      const dab = va.distanceToSquared(vb)
      const dbc = vb.distanceToSquared(vc)
      const dac = va.distanceToSquared(vc)

      let edge: number
      let vm: THREE.Vector3
      const m = newPositions.length / 3

      // 三角形细分逻辑
      let triAIdx = [aIdx, bIdx, cIdx]
      let triBIdx = [aIdx, bIdx, cIdx]

      if (dab > maxEdgeLengthSquared || dbc > maxEdgeLengthSquared || dac > maxEdgeLengthSquared) {
        if (dab >= dbc && dab >= dac) {
          // 细分边AB
          vm = va.clone().lerp(vb, 0.5) // 计算新顶点
          triAIdx = [aIdx, m, cIdx]
          triBIdx = [m, bIdx, cIdx]
          edge = 0
        } else if (dbc >= dab && dbc >= dac) {
          // 细分边BC
          vm = vb.clone().lerp(vc, 0.5)
          triAIdx = [aIdx, bIdx, m]
          triBIdx = [m, cIdx, aIdx]
          edge = 1
        } else {
          // 细分边AC
          vm = va.clone().lerp(vc, 0.5)
          triAIdx = [aIdx, m, bIdx]
          triBIdx = [m, bIdx, cIdx]
          edge = 2
        }

        // 添加新顶点
        newPositions.push(vm.x, vm.y, vm.z)

        // 更新细分后的索引
        newIndices.push(...triAIdx, ...triBIdx)

        // 处理 UV 数据
        if (uvs) {
          const uvA = new THREE.Vector2(uvs[aIdx * 2], uvs[aIdx * 2 + 1])
          const uvB = new THREE.Vector2(uvs[bIdx * 2], uvs[bIdx * 2 + 1])
          const uvC = new THREE.Vector2(uvs[cIdx * 2], uvs[cIdx * 2 + 1])
          let uvM: THREE.Vector2
          let uvsTriA: number[]
          let uvsTriB: number[]

          if (edge === 0) {
            uvM = uvA.clone().lerp(uvB, 0.5)
            uvsTriA = [uvA.x, uvA.y, uvM.x, uvM.y, uvC.x, uvC.y]
            uvsTriB = [uvM.x, uvM.y, uvB.x, uvB.y, uvC.x, uvC.y]
          } else if (edge === 1) {
            uvM = uvB.clone().lerp(uvC, 0.5)
            uvsTriA = [uvA.x, uvA.y, uvB.x, uvB.y, uvM.x, uvM.y]
            uvsTriB = [uvM.x, uvM.y, uvC.x, uvC.y, uvA.x, uvA.y]
          } else {
            uvM = uvA.clone().lerp(uvC, 0.5)
            uvsTriA = [uvA.x, uvA.y, uvB.x, uvB.y, uvM.x, uvM.y]
            uvsTriB = [uvM.x, uvM.y, uvB.x, uvB.y, uvC.x, uvC.y]
          }

          newUVs.push(...uvsTriA, ...uvsTriB)
        }
      } else {
        // 无需细分，直接添加原始三角形面
        newIndices.push(aIdx, bIdx, cIdx)
        if (uvs) {
          newUVs.push(
            uvs[aIdx * 2],
            uvs[aIdx * 2 + 1],
            uvs[bIdx * 2],
            uvs[bIdx * 2 + 1],
            uvs[cIdx * 2],
            uvs[cIdx * 2 + 1],
          )
        }
      }
    }

    // 更新几何体的顶点位置
    geometry.setAttribute('position', new THREE.BufferAttribute(newPositions, 3))
    geometry.attributes.position.needsUpdate = true

    // 更新几何体的索引
    geometry.setIndex(newIndices)

    // 更新 UV 数据
    if (uvAttribute) {
      geometry.setAttribute('uv', new THREE.BufferAttribute(newUVs, 2))
      geometry.attributes.uv.needsUpdate = true
    }
  },

  // 原始几何体对象会被重复细分 times 次。每次细分都会增加几何体的面数和顶点数，从而提高模型的细节水平
  tessellateRepeat: function (
    geometry: THREE.BufferGeometry,
    maxEdgeLength: number,
    times: number,
  ): void {
    for (let i = 0; i < times; i++) {
      BAS.Utils.tessellate(geometry, maxEdgeLength)
    }
  },

  // 细分
  subdivide: function (geometry: THREE.BufferGeometry, subdivisions: number): void {
    // 变量： WARNINGS, 值为 false
    const WARNINGS = !true
    const ABC = ['a', 'b', 'c']

    // while 循环, 每次自减
    while (subdivisions-- > 0) {
      smooth(geometry)
    }

    // delete geometry.__tmpVertices
    // geometry.computeFaceNormals()
    geometry.computeVertexNormals()

    /**
     *
     * @param {顶点索引} a
     * @param {顶点索引} b
     * @param {几何体的顶点数组} vertices
     * @param {边信息映射} map
     * @param {当前处理的面的引用} face
     * @param {存储顶点边信息的数组} metaVertices
     */
    function processEdge(
      a: number,
      b: number,
      vertices: THREE.Vector3[],
      map: Record<string, any>,
      face: number[],
      metaVertices: any[],
    ): void {
      const vertexIndexA = Math.min(a, b)
      const vertexIndexB = Math.max(a, b)
      const key = `${vertexIndexA}_${vertexIndexB}`

      let edge

      if (key in map) {
        edge = map[key]
      } else {
        const vertexA = vertices[vertexIndexA]
        const vertexB = vertices[vertexIndexB]
        edge = {
          a: vertexA,
          b: vertexB,
          newEdge: null,
          faces: [],
        }
        map[key] = edge
      }

      edge.faces.push(face)
      metaVertices[a].edges.push(edge)
      metaVertices[b].edges.push(edge)
    }

    function newFace(newFaces: number[], a: number, b: number, c: number): void {
      // 将面通过索引表示，在 BufferGeometry 中是由索引数组表示的
      newFaces.push(a, b, c)
    }

    function smooth(geometry: THREE.BufferGeometry): void {
      const tmp = new THREE.Vector3()

      let n, l, i, il, j, k

      // 获取原始几何体的顶点数组
      const oldVertices: THREE.Vector3[] = []
      const positions = geometry.attributes.position.array
      for (let i = 0; i < positions.length; i += 3) {
        oldVertices.push(new THREE.Vector3(positions[i], positions[i + 1], positions[i + 2]))
      }

      const oldFaces = geometry.index ? Array.from(geometry.index.array) : []

      // 新数组 metaVertices 和 sourceEdges
      const metaVertices: any[] = new Array(oldVertices.length)
      const sourceEdges: Record<string, any> = {}

      // 生成边缘信息
      generateLookups(oldVertices, oldFaces, metaVertices, sourceEdges)

      // 初始化边顶点数组
      const newEdgeVertices: THREE.Vector3[] = []
      let other, currentEdge, newEdge, face
      let edgeVertexWeight, adjacentVertexWeight, connectedFaces

      // 处理每一条边
      for (const i in sourceEdges) {
        currentEdge = sourceEdges[i]
        newEdge = new THREE.Vector3()

        edgeVertexWeight = 3 / 8
        adjacentVertexWeight = 1 / 8

        connectedFaces = currentEdge.faces.length

        // 检查连接面数，应该是 2
        if (connectedFaces !== 2) {
          edgeVertexWeight = 0.5
          adjacentVertexWeight = 0

          if (connectedFaces !== 1) {
            console.warn(
              'Subdivision Modifier: Number of connected faces != 2, is:',
              connectedFaces,
              currentEdge,
            )
          }
        }

        newEdge.addVectors(currentEdge.a, currentEdge.b).multiplyScalar(edgeVertexWeight)
        tmp.set(0, 0, 0)

        // 处理与边连接的面
        for (j = 0; j < connectedFaces; j++) {
          face = currentEdge.faces[j]
          for (k = 0; k < 3; k++) {
            other = oldVertices[face[ABC[k]]]
            if (other !== currentEdge.a && other !== currentEdge.b) break
          }
          tmp.add(other)
        }

        tmp.multiplyScalar(adjacentVertexWeight)
        newEdge.add(tmp)

        currentEdge.newEdge = newEdgeVertices.length
        newEdgeVertices.push(newEdge)
      }

      let beta, sourceVertexWeight, connectingVertexWeight
      let connectingEdge, connectingEdges, oldVertex, newSourceVertex

      // 用于存储新边、新边顶点和新源顶点
      const newSourceVertices: THREE.Vector3[] = []

      // 处理每一个源顶点
      for (i = 0, il = oldVertices.length; i < il; i++) {
        oldVertex = oldVertices[i]

        // 查找所有连接边
        connectingEdges = metaVertices[i].edges
        n = connectingEdges.length
        beta = n === 3 ? 3 / 16 : 3 / (8 * n)

        sourceVertexWeight = 1 - n * beta
        connectingVertexWeight = beta

        newSourceVertex = oldVertex.clone().multiplyScalar(sourceVertexWeight)
        tmp.set(0, 0, 0)

        // 计算与连接边的权重
        for (j = 0; j < n; j++) {
          connectingEdge = connectingEdges[j]
          other = connectingEdge.a !== oldVertex ? connectingEdge.a : connectingEdge.b
          tmp.add(other)
        }

        tmp.multiplyScalar(connectingVertexWeight)
        newSourceVertex.add(tmp)

        newSourceVertices.push(newSourceVertex)
      }

      const newVertices: THREE.Vector3[] = newSourceVertices.concat(newEdgeVertices)
      const sl = newSourceVertices.length
      const newFaces: number[] = []

      // 处理每一个旧面，生成新的面
      for (i = 0, il = oldFaces.length; i < il; i++) {
        face = oldFaces[i]

        // 查找新边顶点
        const edge1 = getEdge(face, face + 1, sourceEdges).newEdge + sl
        const edge2 = getEdge(face + 1, face + 2, sourceEdges).newEdge + sl
        const edge3 = getEdge(face + 2, face, sourceEdges).newEdge + sl

        // 创建 4 个面
        newFace(newFaces, edge1, edge2, edge3)
        newFace(newFaces, face, edge1, edge3)
        newFace(newFaces, face + 1, edge2, edge1)
        newFace(newFaces, face + 2, edge3, edge2)
      }

      // 更新 BufferGeometry 的索引和顶点数据
      geometry.setAttribute(
        'position',
        new THREE.BufferAttribute(new Float32Array(newVertices.length * 3), 3),
      )
      geometry.setIndex(newFaces)
    }

    /**
     *
     * @param {几何体的顶点数组} vertices
     * @param {几何体的面数组} faces
     * @param {用于存储顶点的边信息的数组} metaVertices
     * @param {用于存储边的信息的对象} edges
     */
    function generateLookups(
      vertices: THREE.Vector3[],
      faces: number[],
      metaVertices: any[],
      edges: Record<string, any>,
    ): void {
      let i, il, face, edge
      // 遍历几何体的每个顶点
      for (i = 0, il = vertices.length; i < il; i++) {
        // 对于每个顶点，创建一个对象，其中包含一个空数组 edges，用于存储与该顶点相关的边信息
        metaVertices[i] = { edges: [] }
      }

      // 遍历几何体的每个面
      for (i = 0, il = faces.length / 3; i < il; i++) {
        const a = faces[i * 3]
        const b = faces[i * 3 + 1]
        const c = faces[i * 3 + 2]
        face = [a, b, c]

        // 当前面上的每条边调用 processEdge 函数
        processEdge(a, b, vertices, edges, face, metaVertices)
        processEdge(b, c, vertices, edges, face, metaVertices)
        processEdge(c, a, vertices, edges, face, metaVertices)
      }
    }

    function getEdge(a: number, b: number, map: Record<string, any>): any {
      const vertexIndexA = Math.min(a, b)
      const vertexIndexB = Math.max(a, b)
      const key = `${vertexIndexA}_${vertexIndexB}`
      return map[key]
    }
  },

  // 计算给定几何图形 geometry中某个面的质心
  computeCentroid: (function () {
    return function (geometry: THREE.BufferGeometry, face: number[]) {
      const v = new THREE.Vector3()

      // 获取 positions 属性（顶点位置数据）
      const positions = geometry.attributes.position.array
      const a = face[0]
      const b = face[1]
      const c = face[2]
      // 从 positions 数组获取每个顶点的坐标
      const ax = positions[a * 3]
      const ay = positions[a * 3 + 1]
      const az = positions[a * 3 + 2]

      const bx = positions[b * 3]
      const by = positions[b * 3 + 1]
      const bz = positions[b * 3 + 2]

      const cx = positions[c * 3]
      const cy = positions[c * 3 + 1]
      const cz = positions[c * 3 + 2]

      // 计算重心
      v.x = (ax + bx + cx) / 3
      v.y = (ay + by + cy) / 3
      v.z = (az + bz + cz) / 3
      return v
    }
  })(),
}

export class ModelBufferGeometry extends THREE.BufferGeometry {
  modelGeometry: THREE.BufferGeometry
  faceCount: number
  vertexCount: number

  constructor(model: THREE.BufferGeometry) {
    super()
    this.modelGeometry = model
    this.faceCount = model.index ? model.index.count / 3 : 0
    this.vertexCount = model.getAttribute('position') ? model.getAttribute('position').count : 0

    this.bufferIndices()
    this.bufferPositions()
  }

  // 缓冲索引数据
  bufferIndices(): void {
    if (this.modelGeometry.index) {
      const indexBuffer = this.modelGeometry.index.array
      this.setIndex(new THREE.BufferAttribute(indexBuffer, 1))
    }
  }

  // 缓冲位置数据
  bufferPositions(): void {
    const positionAttribute = this.modelGeometry.getAttribute('position')
    if (!positionAttribute) return

    const positionBuffer = this.createAttribute('position', 3)
    const positions = positionBuffer.array
    const positionArray = positionAttribute.array

    // 复制 position 数组到当前几何体
    for (let i = 0, offset = 0; i < this.vertexCount; i++, offset += 3) {
      positions[offset] = positionArray[i * 3]
      positions[offset + 1] = positionArray[i * 3 + 1]
      positions[offset + 2] = positionArray[i * 3 + 2]
    }

    this.setAttribute('position', positionBuffer)
  }

  // 缓冲 UV 数据
  bufferUVs(): void {
    const uvAttribute = this.modelGeometry.getAttribute('uv')
    if (!uvAttribute) return

    const uvBuffer = this.createAttribute('uv', 2)
    const uvs = uvBuffer.array
    const uvArray = uvAttribute.array

    // 根据索引将 UV 数据拷贝到新 BufferAttribute 中
    for (let i = 0; i < this.faceCount; i++) {
      const idxA = this.modelGeometry.index.array[i * 3]
      const idxB = this.modelGeometry.index.array[i * 3 + 1]
      const idxC = this.modelGeometry.index.array[i * 3 + 2]

      // 设置每个顶点的 UV 数据
      uvs[idxA * 2] = uvArray[i * 6]
      uvs[idxA * 2 + 1] = uvArray[i * 6 + 1]

      uvs[idxB * 2] = uvArray[i * 6 + 2]
      uvs[idxB * 2 + 1] = uvArray[i * 6 + 3]

      uvs[idxC * 2] = uvArray[i * 6 + 4]
      uvs[idxC * 2 + 1] = uvArray[i * 6 + 5]
    }

    this.setAttribute('uv', uvBuffer)
  }

  // 创建 BufferAttribute
  createAttribute(name: string, itemSize: number): THREE.BufferAttribute {
    const buffer = new Float32Array(this.vertexCount * itemSize)
    const attribute = new THREE.BufferAttribute(buffer, itemSize)

    this.setAttribute(name, attribute)
    return attribute
  }
}

BAS.PrefabBufferGeometry = function (prefab: THREE.BufferGeometry, count: number) {
  THREE.BufferGeometry.call(this)

  this.prefabGeometry = prefab
  this.prefabCount = count
  this.prefabVertexCount = prefab.attributes.position.count

  this.bufferIndices()
  this.bufferPositions()
}
BAS.PrefabBufferGeometry.prototype = Object.create(THREE.BufferGeometry.prototype)
BAS.PrefabBufferGeometry.prototype.constructor = BAS.PrefabBufferGeometry

BAS.PrefabBufferGeometry.prototype.bufferIndices = function () {
  const prefabFaceCount = this.prefabGeometry.index?.count || 0
  const prefabIndexCount = prefabFaceCount * 3 // 每个面有3个顶点
  const prefabIndices: number[] = []

  for (let h = 0; h < prefabFaceCount; h++) {
    const indexArray = this.prefabGeometry.index?.array as number[]
    prefabIndices.push(indexArray[h * 3], indexArray[h * 3 + 1], indexArray[h * 3 + 2])
  }

  const indexBuffer = new Uint32Array(this.prefabCount * prefabIndexCount)

  this.setIndex(new THREE.BufferAttribute(indexBuffer, 1))

  for (let i = 0; i < this.prefabCount; i++) {
    for (let k = 0; k < prefabIndexCount; k++) {
      indexBuffer[i * prefabIndexCount + k] = prefabIndices[k] + i * this.prefabVertexCount
    }
  }
}

BAS.PrefabBufferGeometry.prototype.bufferPositions = function () {
  const positionBuffer = this.createAttribute('position', 3).array as Float32Array

  console.log(5555)
  console.log(this.prefabGeometry)
  const positions = this.prefabGeometry.attributes.position.array

  for (let i = 0, offset = 0; i < this.prefabCount; i++) {
    for (let j = 0; j < this.prefabVertexCount; j++, offset += 3) {
      const prefabVertex = new THREE.Vector3().fromArray(positions, j * 3)

      positionBuffer[offset] = prefabVertex.x
      positionBuffer[offset + 1] = prefabVertex.y
      positionBuffer[offset + 2] = prefabVertex.z
    }
  }
}

// todo test
BAS.PrefabBufferGeometry.prototype.bufferUvs = function () {
  const prefabFaceCount = this.prefabGeometry.index?.count || 0
  const prefabVertexCount = this.prefabGeometry.attributes.position.count
  const prefabUvs: THREE.Vector2[] = []

  for (let h = 0; h < prefabFaceCount; h++) {
    const face = this.prefabGeometry.index?.array as number[]
    const uv = this.prefabGeometry.attributes.uv?.array as number[]

    prefabUvs[face[h * 3]] = new THREE.Vector2(uv[h * 2], uv[h * 2 + 1])
    prefabUvs[face[h * 3 + 1]] = new THREE.Vector2(uv[h * 2 + 2], uv[h * 2 + 3])
    prefabUvs[face[h * 3 + 2]] = new THREE.Vector2(uv[h * 2 + 4], uv[h * 2 + 5])
  }

  const uvBuffer = this.createAttribute('uv', 2)

  for (let i = 0, offset = 0; i < this.prefabCount; i++) {
    for (let j = 0; j < prefabVertexCount; j++, offset += 2) {
      const prefabUv = prefabUvs[j]

      uvBuffer.array[offset] = prefabUv.x
      uvBuffer.array[offset + 1] = prefabUv.y
    }
  }
}

/**
 * based on BufferGeometry.computeVertexNormals
 * calculate vertex normals for a prefab, and repeat the data in the normal buffer
 */
BAS.PrefabBufferGeometry.prototype.computeVertexNormals = function () {
  const index = this.index
  const attributes = this.attributes
  const positions = attributes.position.array

  if (attributes.normal === undefined) {
    this.addAttribute('normal', new THREE.BufferAttribute(new Float32Array(positions.length), 3))
    // this.setAttribute('normal', new THREE.BufferAttribute(new Float32Array(positions.length), 3))
  }

  const normals = attributes.normal.array

  let vA, vB, vC
  const pA = new THREE.Vector3()
  const pB = new THREE.Vector3()
  const pC = new THREE.Vector3()
  const cb = new THREE.Vector3()
  const ab = new THREE.Vector3()

  const indices = index.array as number[]
  const prefabIndexCount = this.prefabGeometry.index?.count || 0

  for (let i = 0; i < prefabIndexCount; i += 3) {
    vA = indices[i + 0] * 3
    vB = indices[i + 1] * 3
    vC = indices[i + 2] * 3

    pA.fromArray(positions, vA)
    pB.fromArray(positions, vB)
    pC.fromArray(positions, vC)

    cb.subVectors(pC, pB)
    ab.subVectors(pA, pB)
    cb.cross(ab)

    normals[vA] += cb.x
    normals[vA + 1] += cb.y
    normals[vA + 2] += cb.z

    normals[vB] += cb.x
    normals[vB + 1] += cb.y
    normals[vB + 2] += cb.z

    normals[vC] += cb.x
    normals[vC + 1] += cb.y
    normals[vC + 2] += cb.z
  }

  for (let j = 1; j < this.prefabCount; j++) {
    for (let k = 0; k < prefabIndexCount; k++) {
      normals[j * prefabIndexCount + k] = normals[k]
    }
  }

  this.normalizeNormals()
  attributes.normal.needsUpdate = true
}

BAS.PrefabBufferGeometry.prototype.createAttribute = function (
  name: string,
  itemSize: number,
  factory: any,
) {
  const buffer = new Float32Array(this.prefabCount * this.prefabVertexCount * itemSize)
  const attribute = new THREE.BufferAttribute(buffer, itemSize)

  // this.addAttribute(name, attribute)
  this.setAttribute(name, attribute)

  if (factory) {
    for (let i = 0, offset = 0; i < this.prefabCount; i++) {
      const r = factory(i, this.prefabCount)

      for (let j = 0; j < this.prefabVertexCount; j++) {
        for (let k = 0; k < itemSize; k++) {
          buffer[offset++] = typeof r === 'number' ? r : r[k]
        }
      }
    }
  }

  return attribute
}

BAS.PrefabBufferGeometry.prototype.setAttribute4 = function (name: string, data: THREE.Vector4[]) {
  let offset = 0
  //   const array = (this.attributes[name] as THREE.BufferAttribute).array;
  const array = this.geometry.attributes[name].array
  let i, j

  for (i = 0; i < data.length; i++) {
    const v = data[i]

    for (j = 0; j < this.prefabVertexCount; j++) {
      array[offset++] = v.x
      array[offset++] = v.y
      array[offset++] = v.z
      array[offset++] = v.w
    }
  }

  //   (this.attributes[name] as THREE.BufferAttribute).needsUpdate = true;
  this.geometry.attributes[name].needsUpdate = true
}
BAS.PrefabBufferGeometry.prototype.setAttribute3 = function (name: string, data: THREE.Vector3[]) {
  let offset = 0
  const array = this.geometry.attributes[name].array
  let i, j

  for (i = 0; i < data.length; i++) {
    const v = data[i]

    for (j = 0; j < this.prefabVertexCount; j++) {
      array[offset++] = v.x
      array[offset++] = v.y
      array[offset++] = v.z
    }
  }

  this.geometry.attributes[name].needsUpdate = true
}
BAS.PrefabBufferGeometry.prototype.setAttribute2 = function (name: string, data: THREE.Vector2[]) {
  let offset = 0
  const array = this.geometry.attributes[name].array
  let i, j

  for (i = 0; i < this.prefabCount; i++) {
    const v = data[i]

    for (j = 0; j < this.prefabVertexCount; j++) {
      array[offset++] = v.x
      array[offset++] = v.y
    }
  }

  this.geometry.attributes[name].needsUpdate = true
}

BAS.BaseAnimationMaterial = function (parameters: THREE.ShaderMaterialParameters = {}) {
  THREE.ShaderMaterial.call(this)

  this.shaderFunctions = []
  this.shaderParameters = []
  this.shaderVertexInit = []
  this.shaderTransformNormal = []
  this.shaderTransformPosition = []

  this.setValues(parameters)
}
BAS.BaseAnimationMaterial.prototype = Object.create(THREE.ShaderMaterial.prototype)
BAS.BaseAnimationMaterial.prototype.constructor = BAS.BaseAnimationMaterial

// abstract
BAS.BaseAnimationMaterial.prototype._concatVertexShader = function () {
  return ''
}

BAS.BaseAnimationMaterial.prototype._concatFunctions = function () {
  return this.shaderFunctions.join('\n')
}
BAS.BaseAnimationMaterial.prototype._concatParameters = function () {
  return this.shaderParameters.join('\n')
}
BAS.BaseAnimationMaterial.prototype._concatVertexInit = function () {
  return this.shaderVertexInit.join('\n')
}
BAS.BaseAnimationMaterial.prototype._concatTransformNormal = function () {
  return this.shaderTransformNormal.join('\n')
}
BAS.BaseAnimationMaterial.prototype._concatTransformPosition = function () {
  return this.shaderTransformPosition.join('\n')
}

BAS.BaseAnimationMaterial.prototype.setUniformValues = function (values: Record<string, any>) {
  for (const key in values) {
    if (key in this.uniforms) {
      const uniform = this.uniforms[key]
      const value = values[key]

      // todo add matrix uniform types
      switch (uniform.type) {
        case 'c': // color
          uniform.value.set(value)
          break
        case 'v2': // vectors
        case 'v3':
        case 'v4':
          uniform.value.copy(value)
          break
        case 'f': // float
        case 't': // texture
        default:
          uniform.value = value
      }
    }
  }
}

BAS.BasicAnimationMaterial = function (
  parameters: THREE.ShaderMaterialParameters,
  uniformValues: { [key: string]: any },
) {
  BAS.BaseAnimationMaterial.call(this, parameters)

  const basicShader = THREE.ShaderLib['basic']

  this.uniforms = THREE.UniformsUtils.merge([basicShader.uniforms, this.uniforms])
  this.lights = false
  this.vertexShader = this._concatVertexShader()
  this.fragmentShader = basicShader.fragmentShader

  // todo add missing default defines
  // uniformValues.map && (this.defines['USE_MAP'] = '')
  // uniformValues.normalMap && (this.defines['USE_NORMALMAP'] = '')

  if (!this.defines) {
    this.defines = {}
  }
  if (uniformValues.map) {
    this.defines['USE_MAP'] = ''
  }
  if (uniformValues.normalMap) {
    this.defines['USE_NORMALMAP'] = ''
  }
  this.setUniformValues(uniformValues)
}
BAS.BasicAnimationMaterial.prototype = Object.create(BAS.BaseAnimationMaterial.prototype)
BAS.BasicAnimationMaterial.prototype.constructor = BAS.BasicAnimationMaterial

BAS.BasicAnimationMaterial.prototype._concatVertexShader = function () {
  // based on THREE.ShaderLib.phong
  return [
    THREE.ShaderChunk['common'],
    THREE.ShaderChunk['uv_pars_vertex'],
    THREE.ShaderChunk['uv2_pars_vertex'],
    THREE.ShaderChunk['envmap_pars_vertex'],
    THREE.ShaderChunk['color_pars_vertex'],
    THREE.ShaderChunk['morphtarget_pars_vertex'],
    THREE.ShaderChunk['skinning_pars_vertex'],
    THREE.ShaderChunk['logdepthbuf_pars_vertex'],

    this._concatFunctions(),

    this._concatParameters(),

    'void main() {',

    this._concatVertexInit(),

    THREE.ShaderChunk['uv_vertex'],
    THREE.ShaderChunk['uv2_vertex'],
    THREE.ShaderChunk['color_vertex'],
    THREE.ShaderChunk['skinbase_vertex'],

    '	#ifdef USE_ENVMAP',

    THREE.ShaderChunk['beginnormal_vertex'],

    this._concatTransformNormal(),

    THREE.ShaderChunk['morphnormal_vertex'],
    THREE.ShaderChunk['skinnormal_vertex'],
    THREE.ShaderChunk['defaultnormal_vertex'],

    '	#endif',

    THREE.ShaderChunk['begin_vertex'],

    this._concatTransformPosition(),

    THREE.ShaderChunk['morphtarget_vertex'],
    THREE.ShaderChunk['skinning_vertex'],
    THREE.ShaderChunk['project_vertex'],
    THREE.ShaderChunk['logdepthbuf_vertex'],

    THREE.ShaderChunk['worldpos_vertex'],
    THREE.ShaderChunk['envmap_vertex'],

    '}',
  ].join('\n')
}

BAS.PhongAnimationMaterial = function (
  parameters: THREE.MeshPhongMaterialParameters,
  uniformValues: { [key: string]: any },
) {
  BAS.BaseAnimationMaterial.call(this, parameters)

  const phongShader = THREE.ShaderLib['phong']

  this.uniforms = THREE.UniformsUtils.merge([phongShader.uniforms, this.uniforms])
  this.lights = true
  this.vertexShader = this._concatVertexShader()
  this.fragmentShader = phongShader.fragmentShader

  // todo add missing default defines
  uniformValues.map && (this.defines['USE_MAP'] = '')
  uniformValues.normalMap && (this.defines['USE_NORMALMAP'] = '')

  this.setUniformValues(uniformValues)
}
BAS.PhongAnimationMaterial.prototype = Object.create(BAS.BaseAnimationMaterial.prototype)
BAS.PhongAnimationMaterial.prototype.constructor = BAS.PhongAnimationMaterial

BAS.PhongAnimationMaterial.prototype._concatVertexShader = function () {
  // based on THREE.ShaderLib.phong
  return [
    '#define PHONG',

    'varying vec3 vViewPosition;',

    '#ifndef FLAT_SHADED',

    '	varying vec3 vNormal;',

    '#endif',

    THREE.ShaderChunk['common'],
    THREE.ShaderChunk['uv_pars_vertex'],
    THREE.ShaderChunk['uv2_pars_vertex'],
    THREE.ShaderChunk['displacementmap_pars_vertex'],
    THREE.ShaderChunk['envmap_pars_vertex'],
    THREE.ShaderChunk['lights_phong_pars_vertex'],
    THREE.ShaderChunk['color_pars_vertex'],
    THREE.ShaderChunk['morphtarget_pars_vertex'],
    THREE.ShaderChunk['skinning_pars_vertex'],
    THREE.ShaderChunk['shadowmap_pars_vertex'],
    THREE.ShaderChunk['logdepthbuf_pars_vertex'],

    this._concatFunctions(),

    this._concatParameters(),

    'void main() {',

    this._concatVertexInit(),

    THREE.ShaderChunk['uv_vertex'],
    THREE.ShaderChunk['uv2_vertex'],
    THREE.ShaderChunk['color_vertex'],
    THREE.ShaderChunk['beginnormal_vertex'],

    this._concatTransformNormal(),

    THREE.ShaderChunk['morphnormal_vertex'],
    THREE.ShaderChunk['skinbase_vertex'],
    THREE.ShaderChunk['skinnormal_vertex'],
    THREE.ShaderChunk['defaultnormal_vertex'],

    '#ifndef FLAT_SHADED', // Normal computed with derivatives when FLAT_SHADED

    '	vNormal = normalize( transformedNormal );',

    '#endif',

    THREE.ShaderChunk['begin_vertex'],

    this._concatTransformPosition(),

    THREE.ShaderChunk['displacementmap_vertex'],
    THREE.ShaderChunk['morphtarget_vertex'],
    THREE.ShaderChunk['skinning_vertex'],
    THREE.ShaderChunk['project_vertex'],
    THREE.ShaderChunk['logdepthbuf_vertex'],

    '	vViewPosition = - mvPosition.xyz;',

    THREE.ShaderChunk['worldpos_vertex'],
    THREE.ShaderChunk['envmap_vertex'],
    THREE.ShaderChunk['lights_phong_vertex'],
    THREE.ShaderChunk['shadowmap_vertex'],

    '}',
  ].join('\n')
}

export default BAS
