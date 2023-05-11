import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  static outlets = ['filters']
  static targets = ['filter', 'text']

  static values = {
    filterKey: String,
    parser: String,
    label: String,
  }

  initialize() {
    this.parsers = {
      km: (selectedValues, defaults) => {
        const [min, max] = selectedValues

        const filters = {
          [`min_${this.filterKeyValue}`]: min,
          [`max_${this.filterKeyValue}`]: max
        }

        let minText, maxText;

        let displayText;

        if (Number(min) === defaults.min && Number(max) === defaults.max) {
          displayText = this.labelValue
        } else {
          minText = `${min}km`
          maxText = Number(max) === defaults.max ? `> ${defaults.max}km` : `${max}km`
  
          displayText = `${minText} to ${maxText}`
        }

        return { filters, displayText }
      },
      hours: (selectedValues, defaults) => {
        const [min, max] = selectedValues

        const filters = {
          [`min_${this.filterKeyValue}`]: min,
          [`max_${this.filterKeyValue}`]: max
        }

        let minText, maxText;

        if (Number(min) % 1 === 0) {
          minText = `${Number(min)}h`
        } else {
          minText = `${min[0]}h 30m`
        }
  
        if (Number(max) % 1 === 0) {
          maxText = Number(max) === defaults.max ? `> ${defaults.max}h` : `${Number(max)}h`
        } else {
          maxText = `${max[0]}h 30m`
        }

        let displayText;

        if (Number(min) === defaults.min && Number(max) === defaults.max) {
          displayText = this.labelValue
        } else {
          displayText = `${minText} to ${maxText}`
        }

        return { filters, displayText }
      }
    }
  }

  connect() {
    this.filterOutlet = this.filtersOutlets[0]
  }

  propagateFilterChange(e) {
    const selectedValues = e.detail

    if (selectedValues.length === 0) {
      this.textTarget.innerHTML = this.labelValue
    } else {
      this.textTarget.innerHTML = `${this.labelValue} (${selectedValues.length})`
    }

    // if (text) {
    //   this.textTarget.innerHTML = text
    // } else {
    //   this.textTarget.innerHTML = this.labelValue
    // }

    console.log({ [this.filterKeyValue]: selectedValues })

    this.filterOutlet.updateFilters({ [this.filterKeyValue]: selectedValues })
  }
  
  propagateRangeSliderFilterChange({ detail: { values, defaults } }) {
    const parsedFilters = this.parsers[this.parserValue](values, defaults)

    this.textTarget.innerHTML = parsedFilters.displayText

    console.log(parsedFilters)
    // const [min, max] = values
    
    // const filters = {
    //   [`min_${this.filterKeyValue}`]: min,
    //   [`max_${this.filterKeyValue}`]: max
    // }
    
    // console.log(filters)

    this.filterOutlet.updateFilters(parsedFilters.filters)
  }
}
