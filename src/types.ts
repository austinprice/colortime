import { EventHandler } from '@create-figma-plugin/utilities'

export interface PaintRectanglesHandler extends EventHandler {
  name: 'PAINT_RECTANGLES'
  handler: (hValue: number | null, sValue: number | null, lValue: number | null) => void
}

export interface BumpPaintHandler extends EventHandler {
  name: 'BUMP_PAINT'
  handler: (modelValue: string, bumpValue: number | null) => void
}

export interface CreateRectanglesHandler extends EventHandler {
  name: 'CREATE_RECTANGLES'
  handler: (count: number) => void
}

export interface CloseHandler extends EventHandler {
  name: 'CLOSE'
  handler: () => void
}
