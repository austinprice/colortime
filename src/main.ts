import { once, on, showUI, emit } from '@create-figma-plugin/utilities'
import { CloseHandler, BumpPaintHandler, PaintRectanglesHandler } from './types'
import { toSolidPaint, toHsl, ColorFormat, solidPaintToWebRgb } from 'figx';

export default function () {
  const fillableTypes: Array<any> = ['BOOLEAN_OPERATION', 'COMPONENT', 'COMPONENT_SET', 'ELLIPSE', 'FRAME', 'HIGHLIGHT', 'INSTANCE', 'LINE', 'POLYGON', 'RECTANGLE', 'SECTION', 'SHAPE_WITH_TEXT', 'STAMP', 'STAR', 'STICKY', 'TEXT', 'VECTOR', 'WASHI_TAPE']
  const setColorValues = function() {
    let hValues = [] as Array<number>
    let sValues = [] as Array<number>
    let lValues = [] as Array<number>

    if (!figma.currentPage.selection.length) return
    for (const node of figma.currentPage.selection) {
      if ("fills" in node) {
        let hslArray:Array<number> = []
        hslArray = extractHSL(node) as Array<number>
        if (hslArray.length === 3) {
          hValues.push(Math.round(hslArray[0]))
          sValues.push(Math.round(hslArray[1]))
          lValues.push(Math.round(hslArray[2]))
        }
      }

      if ("children" in node) {
        figma.skipInvisibleInstanceChildren = true
        const childNodes = node.findAllWithCriteria({
          types: fillableTypes
        })
        for (const child of childNodes) {
          let hslArray:Array<number> = []
          hslArray = extractHSL(child) as Array<number>
          if (hslArray.length === 3) {
            hValues.push(Math.round(hslArray[0]))
            sValues.push(Math.round(hslArray[1]))
            lValues.push(Math.round(hslArray[2]))
          }
        }
        figma.skipInvisibleInstanceChildren = false
      }
    }
    
    const hEqual = hValues.every(val => val === hValues[0])
    const sEqual = sValues.every(val => val === sValues[0])
    const lEqual = lValues.every(val => val === lValues[0])

    emit('setDisablePaintAction', true);
    if (hEqual) {
      emit('setSelectedHValue', hValues[0])
      emit('setHValueDisabled', false)
    } else emit('setHValueDisabled', true)

    if (sEqual) {
      emit('setSValueDisabled', false)
      emit('setSelectedSValue', sValues[0])
    } else emit('setSValueDisabled', true)

    if (lEqual) {
      emit('setSelectedLValue', lValues[0])
      emit('setLValueDisabled', false)
    } else emit('setLValueDisabled', true)

    emit('setDisablePaintAction', false);
  }
  const extractHSL = function (node: SceneNode) {
    if ("fills" in node) {
      let fills;

      if (Array.isArray(node.fills) && node.fills.length) {
        // Get the current fills in order to clone and modify them      
        fills = Array.from(node.fills);
        for (const fill of fills) {
          if (!fill.color) return
          const webRGB = solidPaintToWebRgb(fill, ColorFormat.OBJECT) as any
          const hslArray = toHsl(webRGB, ColorFormat.ARRAY) as Array<number>
          if (hslArray.length === 3) return hslArray
        }
      }

      return []
    }
  }
  const bumpColorsInNode = function (node: SceneNode, bumpIndex: number, bumpValue: number) {
    if ("fills" in node) {
      let fills;
      let newHSLValue
      if (Array.isArray(node.fills) && node.fills.length) {
        // Get the current fills in order to clone and modify them      
        fills = Array.from(node.fills);
        for (const fill of fills) {
          if (!fill.color) return
          const webRGB = solidPaintToWebRgb(fill, ColorFormat.OBJECT) as any
          let hslArrayFill = toHsl(webRGB, ColorFormat.ARRAY) as Array<number>
          hslArrayFill[bumpIndex] += bumpValue
          if (hslArrayFill[bumpIndex] < 1) hslArrayFill[bumpIndex] = 1
          if (bumpIndex < 1 && hslArrayFill[bumpIndex] > 359) hslArrayFill[bumpIndex] = 359
          if (bumpIndex > 0 && hslArrayFill[bumpIndex] > 359) hslArrayFill[bumpIndex] = 359
          const hValue = Math.round(hslArrayFill[0])
          const sValue = Math.round(hslArrayFill[1])
          const lValue = Math.round(hslArrayFill[2])    

          newHSLValue =`hsl(${hValue}, ${sValue}%, ${lValue}%)` as any
        }
      }

      if (newHSLValue.length) node.fills = [toSolidPaint(newHSLValue)]
    }
  }
  const paintNode = function (node: SceneNode, hValue: null | number, sValue: null | number, lValue: null | number) {
    if ("fills" in node) {
      let fills;
      let newHSLValue

      if (Array.isArray(node.fills) && node.fills.length) {
        // Get the current fills in order to clone and modify them      
        fills = Array.from(node.fills);
        for (const fill of fills) {
          if (!fill.color) return
          const webRGB = solidPaintToWebRgb(fill, ColorFormat.OBJECT) as any
          const hslArrayFill = toHsl(webRGB, ColorFormat.ARRAY) as Array<number>
          const newHValue = hValue || Math.round(hslArrayFill[0])
          const newSValue = sValue || Math.round(hslArrayFill[1])
          const newLValue = lValue || Math.round(hslArrayFill[2])
          newHSLValue =`hsl(${newHValue}, ${newSValue}%, ${newLValue}%)` as any
        }
      }

      if (newHSLValue.length) node.fills = [toSolidPaint(newHSLValue)]
    }
  }
  figma.once("run", () => {
    setColorValues()
  })
  figma.on("selectionchange", () => {
    if (!figma.currentPage.selection.length) {
      emit('setSelectedHValue', null)
      emit('setSelectedSValue', null)
      emit('setSelectedLValue', null)
      return
    }
    setColorValues()
  })
  on<BumpPaintHandler>('BUMP_PAINT', function (modelValue: string, bumpValue: number | null) {
    if (!modelValue || !bumpValue) return
    const modelValueOptions = ['h', 's', 'l']
    const bumpIndex = modelValueOptions.indexOf(modelValue)

    for (const node of figma.currentPage.selection) {
      if ("fills" in node) {
        bumpColorsInNode(node, bumpIndex, bumpValue)
      }

      if ("children" in node) {
        figma.skipInvisibleInstanceChildren = true
        const childNodes = node.findAllWithCriteria({
          types: fillableTypes
        })
        for (const child of childNodes) {
          bumpColorsInNode(child, bumpIndex, bumpValue)
        }
        figma.skipInvisibleInstanceChildren = false
      }
    }

    setColorValues()
  })
  on<PaintRectanglesHandler>('PAINT_RECTANGLES', function (hValue: number | null, sValue: number | null, lValue: number | null) {
    if (!hValue && !sValue && !lValue) return
    for (const node of figma.currentPage.selection) {
      if ("fills" in node) {
        paintNode(node, hValue, sValue, lValue)
      }

      if ("children" in node) {
        figma.skipInvisibleInstanceChildren = true
        const childNodes = node.findAllWithCriteria({
          types: fillableTypes
        })
        for (const child of childNodes) {
          paintNode(child, hValue, sValue, lValue)
        }
        figma.skipInvisibleInstanceChildren = false
      }
    }
  })
  once<CloseHandler>('CLOSE', function () {
    figma.closePlugin()
  })
  showUI({
    width: 290,
    height: 200
  })
}
