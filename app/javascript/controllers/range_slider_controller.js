import { Controller } from "@hotwired/stimulus"
import noUiSlider from 'nouislider';
import wNumb from "wnumb";

export default class extends Controller {
  static targets = ['min', 'max', 'slider']

  static values = {
    min: Number,
    max: Number,
    step: Number,
    decimalPlaces: Number
  }

  connect() {
    noUiSlider.create(this.sliderTarget, {
      start: [this.minValue, this.maxValue],
      connect: true,
      range: {
        'min': this.minValue,
        'max': this.maxValue
      },
      step: this.stepValue,
      behaviour: 'tap-drag',
      format: wNumb({ decimals: this.decimalPlacesValue }),
    });

    this.sliderTarget.noUiSlider.on('slide', (values) => {
      const [min, max] = values

      this.setSliderValues(min, max)
    })
    
    this.sliderTarget.noUiSlider.on('change', (values) => {
      // const [min, max] = values

      // let text = null
      
      // if (Number(min) === this.minValue && Number(max) === this.maxValue) {
      //   text = null
      // } else {
      //   const [minText, maxText] = this.generateSliderText(min, max)
      //   text = `${minText} to ${maxText}`
      // }
      const defaults = {
        min: this.minValue,
        max: this.maxValue,
      }

      this.dispatch('change', { detail: { values, defaults } })
    })

    this.reset()
  }

  generateSliderText(min, max) {
    let minText, maxText;

    if (this.stepValue === 0.5) {
      if (Number(min) % 1 === 0) {
        minText = `${Number(min)}h`
      } else {
        minText = `${min[0]}h 30m`
      }

      if (Number(max) % 1 === 0) {
        maxText = Number(max) === this.maxValue ? `> ${this.maxValue}h` : `${Number(max)}h`
      } else {
        maxText = `${max[0]}h 30m`
      }
    } else {
      minText = `${min}km`
      maxText = Number(max) === this.maxValue ? `> ${this.maxValue}km` : `${max}km`
    }

    return [minText, maxText]
  }

  setSliderValues(min, max) {
    const [minText, maxText] = this.generateSliderText(min, max)

    this.minTarget.innerHTML = minText
    this.maxTarget.innerHTML = maxText
  }

  // not in use
  reset() {
    this.sliderTarget.noUiSlider.reset()
    this.setSliderValues(this.minValue, this.maxValue)
  }
}
