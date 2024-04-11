import React from 'react'
import noUiSlider from 'nouislider';
import wNumb from "wnumb";

const RangeSlider = ({ label, min, max, step, decimalPlaces, unit, onChange}) => {
  const rangeSliderRef = React.useRef()
  const [showPopover, setShowPopover] = React.useState(false)
  const [displayLabel, setDisplayLabel] = React.useState(label)
  const [minValue, setMinValue] = React.useState(min)
  const [maxValue, setMaxValue] = React.useState(max)

  const handleOutsideClick = React.useCallback((event) => {
    if (!showPopover) { return }
    if (rangeSliderRef?.current?.contains(event.target)) { return }

    setShowPopover(false)
  }, [showPopover])

  React.useEffect(() => {
    document.addEventListener('click', handleOutsideClick)

    return () => {
      document.removeEventListener('click', handleOutsideClick)
    }
  }, [handleOutsideClick])

  React.useEffect(() => {
    const slider = document.getElementById(`${label}-slider`)

    noUiSlider.create(slider, {
      start: [min, max],
      connect: true,
      range: {
        'min': min,
        'max': max
      },
      step: step,
      behaviour: 'tap-drag',
      format: wNumb({ decimals: decimalPlaces }),
    });

    slider.noUiSlider.on('slide', (values) => {
      const [rawMinimum, rawMaximum] = values
      let [currentMinimum, currentMaximum] = values

      if (unit === 'h') {
        if (String(currentMinimum)[String(currentMinimum).length - 1] === '0') {

          currentMinimum = parseInt(currentMinimum)
        }

        if (String(currentMaximum)[String(currentMaximum).length - 1] === '0') {
          currentMaximum = parseInt(currentMaximum)
        }
      }

      setMinValue(currentMinimum)
      setMaxValue(currentMaximum)

      if (rawMinimum == min && rawMaximum == max) {
        setDisplayLabel(label)
      } else if (rawMinimum == min) {
        setDisplayLabel(`< ${currentMaximum}${unit}`)
      } else if (rawMaximum == max) {
        setDisplayLabel(`> ${currentMinimum}${unit}`)
      } else {
        setDisplayLabel(`${currentMinimum} - ${currentMaximum}${unit}`)
      }
    })
    
    slider.noUiSlider.on('change', (values) => {
      const [selectedMinimum, selectedMaximum] = values

      onChange({ min: selectedMinimum, max: selectedMaximum })
    })
  }, [])

  return (
    <div ref={rangeSliderRef} className="flex items-center bg-white rounded-md ml-2 shadow-md relative">
      <div className="flex items-center p-2 cursor-pointer">
        <button onClick={() => setShowPopover(!showPopover)} className="text-xs">{displayLabel}</button>
      </div>
      
      <div className={showPopover ? '' : 'hidden'}>
        <div className="bg-white fixed md:absolute left-0 bottom-0 md:bottom-10 z-600 shadow-md md:rounded-md p-3 w-full md:w-48">
          <div>
            <div className="flex justify-center">
              <label htmlFor="distance">{label}</label>
            </div>
            <hr className="my-1"></hr>
            <div className="flex justify-between mb-2">
              <span>{`${minValue}${unit}`}</span>
              <span>{`${maxValue}${unit}`}</span>
            </div>
            <div id={`${label}-slider`}></div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default RangeSlider;