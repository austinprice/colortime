import {
  Button,
  Columns,
  Container,
  Divider,
  Inline,
  MiddleAlign,
  render,
  Text,
  TextboxNumeric,
  VerticalSpace
} from '@create-figma-plugin/ui'
import { emit, on } from '@create-figma-plugin/utilities'
import { h } from 'preact'
import { useCallback, useEffect, useState,  useContext } from 'preact/hooks'

import { CloseHandler, BumpPaintHandler, PaintRectanglesHandler } from './types'

function Plugin() {
  const [hValueDisabled, setHValueDisabled] = useState<boolean>(false)
  const [sValueDisabled, setSValueDisabled] = useState<boolean>(false)
  const [lValueDisabled, setLValueDisabled] = useState<boolean>(false)
  const [disablePaintAction, setDisablePaintAction] = useState<boolean>(false)

  const [hValue, setHValue] = useState<number | null>(null)
  const [hValueString, setHValueString] = useState('')
  const [sValue, setSValue] = useState<number | null>(null)
  const [sValueString, setSValueString] = useState('')
  const [lValue, setLValue] = useState<number | null>(null)
  const [lValueString, setLValueString] = useState('')

  const [bumpValue, setBumpValue] = useState<number | null>(10)
  const [bumpValueString, setBumpValueString] = useState('10')

  const paintRects = useEffect(() => {
    if (!disablePaintAction) handlePaintRectanglesButtonClick()
  }, [hValue, sValue, lValue]);
  const handlePaintRectanglesButtonClick = useCallback(
    function () {
      emit<PaintRectanglesHandler>('PAINT_RECTANGLES', hValue, sValue, lValue)
    },
    [hValue, sValue, lValue]
  )
  const handleBump = function (modelValue: string, bumpDirection: string) {
    let bump: number | null = bumpValue
    if (bumpDirection === 'down' && bump) bump = -Math.abs(bump)

    emit<BumpPaintHandler>('BUMP_PAINT', modelValue, bump)
  }
  const handleCloseButtonClick = useCallback(function () {
    emit<CloseHandler>('CLOSE')
  }, [])
  on('setSelectedHValue', function(value) {
    const rounded = Math.round(value)
    const text = rounded.toString()
    setHValue(rounded)
    setHValueString(text)
  })
  on('setSelectedSValue', function(value) {
    const rounded = Math.round(value)
    const text = rounded.toString()
    setSValue(rounded)
    setSValueString(text)
  })
  on('setSelectedLValue', function(value) {
    const rounded = Math.round(value)
    const text = rounded.toString()
    setLValue(rounded)
    setLValueString(text)
  })
  on('setHValueDisabled', function(value) {
    setHValueDisabled(value || false)
    if (value) setHValue(null)
  })
  on('setSValueDisabled', function(value) {
    setSValueDisabled(value || false)
    if (value) setSValue(null)
  })
  on('setLValueDisabled', function(value) {
    setLValueDisabled(value || false)
    if (value) setLValue(null)
  })
  on('setDisablePaintAction', function(value) {
    setDisablePaintAction(value)
  })
  return (
    <Container>
      <VerticalSpace space="large" />
      <Columns>
        <Container>
          <TextboxNumeric
            icon="H"
            maximum={360}
            minimum={0}
            disabled={hValueDisabled}
            onNumericValueInput={setHValue}
            onValueInput={setHValueString}
            value={hValueString}
          />
          {hValueDisabled &&
            <a href='#' onClick={() => {setHValueDisabled(false)}}>Unlock</a>
          }
        </Container>
        <Container>
          <TextboxNumeric
            icon="S"
            maximum={100}
            minimum={0}
            disabled={sValueDisabled}
            onNumericValueInput={setSValue}
            onValueInput={setSValueString}
            value={sValueString}
          />
          {sValueDisabled &&
            <a href='#' onClick={() => {setSValueDisabled(false)}}>Unlock</a>
          }
        </Container>
        <Container>
          <TextboxNumeric
            icon="L"
            maximum={100}
            minimum={0}
            disabled={lValueDisabled}
            onNumericValueInput={setLValue}
            onValueInput={setLValueString}
            value={lValueString}
          />
          {lValueDisabled &&
            <a href='#' onClick={() => {setLValueDisabled(false)}}>Unlock</a>
          }
        </Container>
      </Columns>
      <VerticalSpace space="medium" />
      <Divider/>
      <VerticalSpace space="medium" />
      <Columns>
        <Container>
          <h3>Bump</h3>
          <VerticalSpace space="extraSmall" />
          <Text muted>Shift values up or down</Text>
        </Container>
        <MiddleAlign>
          <TextboxNumeric
            style="max-width: 70px"
            maximum={100}
            minimum={0}
            onNumericValueInput={setBumpValue}
            onValueInput={setBumpValueString}
            value={bumpValueString}
          />
        </MiddleAlign>
      </Columns>
      <VerticalSpace space="large" />
      <Container>
        {/* <Columns space="medium">
          <Columns>
            <Button style="padding: 0; border-top-right-radius: 0; border-bottom-right-radius: 0; margin:0;"
                    onClick={() => {handleBump('h', 'down')}} secondary>
              <IconMinus32 ></IconMinus32>
            </Button>
            <MiddleAlign style="padding-right:4px; margin:0;">H</MiddleAlign>
            <Button style="padding: 0; border-top-left-radius: 0; border-bottom-left-radius: 0; margin:0;"
                    onClick={() => {handleBump('h', 'up')}} secondary>
              <IconPlus32></IconPlus32>
            </Button>
          </Columns>
          <Columns>
            <Button style="padding: 0; border-top-right-radius: 0; border-bottom-right-radius: 0;"
                    onClick={() => {handleBump('s', 'down')}} secondary>
              <IconMinus32 ></IconMinus32>
            </Button>
            <MiddleAlign style="padding-right:4px; margin:0;">S</MiddleAlign>
            <Button style="padding: 0; border-top-left-radius: 0; border-bottom-left-radius: 0;"
                    onClick={() => {handleBump('s', 'up')}} secondary>
              <IconPlus32></IconPlus32>
            </Button>
          </Columns>
          <Columns>
            <Button style="padding: 0; border-top-right-radius: 0; border-bottom-right-radius: 0;"
                    onClick={() => {handleBump('l', 'down')}} secondary>
              <IconMinus32 ></IconMinus32>
            </Button>
            <MiddleAlign style="padding-right:4px; margin:0;">L</MiddleAlign>
            <Button style="padding: 0; border-top-left-radius: 0; border-bottom-left-radius: 0;"
                    onClick={() => {handleBump('l', 'up')}} secondary>
              <IconPlus32></IconPlus32>
            </Button>
          </Columns>
        </Columns> */}
        <Columns space="medium">
          <div>
            <Inline>
              <MiddleAlign style="padding-right: 8px;">
                <h3>H</h3>
              </MiddleAlign>
              <button style="font-size:16px; padding: 4px; border-radius: 4px 0 0 4px; border: 1px solid #ccc; width: 24px; text-align:center;"
                onClick={() => {handleBump('h', 'down')}}>-</button>
              <button style="font-size:16px; padding: 4px; border-radius: 0 4px 4px 0; border: 1px solid #ccc; width: 24px; text-align:center; margin: 0 0 0 -1px;"
                onClick={() => {handleBump('h', 'up')}}>+</button>
            </Inline>
          </div>
          <div>
            <Inline>
              <MiddleAlign style="padding-right: 8px;">
                <h3>S</h3>
              </MiddleAlign>
              <button style="font-size:16px; padding: 4px; border-radius: 4px 0 0 4px;; border: 1px solid #ccc; width: 24px; text-align:center;"
                onClick={() => {handleBump('s', 'down')}}>-</button>
              <button style="font-size:16px; padding: 4px; border-radius: 0 4px 4px 0; border: 1px solid #ccc; width: 24px; text-align:center; margin: 0 0 0 -1px;"
                onClick={() => {handleBump('s', 'up')}}>+</button>
            </Inline>
          </div>
          <div>
            <Inline>
              <MiddleAlign style="padding-right: 8px;">
                <h3>L</h3>
              </MiddleAlign>
              <button style="font-size:16px; padding: 4px; border-radius: 4px 0 0 4px; border: 1px solid #ccc; width: 24px; text-align:center;"
                onClick={() => {handleBump('l', 'down')}}>-</button>
              <button style="font-size:16px; padding: 4px; border-radius: 0 4px 4px 0; border: 1px solid #ccc; width: 24px; text-align:center; margin: 0 0 0 -1px;"
                onClick={() => {handleBump('l', 'up')}}>+</button>
              {/* <Button style="padding: 0; border-top-left-radius: 0; border-bottom-left-radius: 0; width: 20px; height: 20px;"
                  onClick={() => {handleBump('l', 'up')}} secondary>
                +
              </Button> */}
            </Inline>
          </div>
        </Columns>
      </Container>
    </Container>
  )
}

export default render(Plugin)
