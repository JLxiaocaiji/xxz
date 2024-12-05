export type DeviceInfo = {
  pixelRatio?: number
  screenWidth?: number
  screenHeight?: number
  windowWidth?: number
  windowHeight?: number
  windowTop?: number
  windowBottom?: number
}

export type Position = {
  width?: number
  height?: number
}

interface ImportMeta {
  glob: (pattern: string, options?: { eager: boolean }) => Record<string, () => Promise<unknown>>
}
