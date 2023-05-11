import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  static targets = ['search', 'item', 'checkbox']

  static values = {}

  connect() {
    console.log('filterableList')
  }

  search() {
    const searchTerm = this.searchTarget.value.toLowerCase()

    this.itemTargets.forEach((item) => {
      if (item.dataset.itemValue.toLowerCase().includes(searchTerm)) {
        item.classList.remove('hidden')
      } else {
        item.classList.add('hidden')
      }
    })
  }

  clearAll() {
    this.checkboxTargets.forEach((checkbox) => {
      checkbox.checked = false
    })

    this.searchTarget.value = ''

    this.search()
  }

  emitFilterChange() {
    let selectedValues = []

    this.checkboxTargets.forEach((checkbox) => {
      if (checkbox.checked) {
        selectedValues.push(checkbox.value)
      }
    })

    this.dispatch('change', { detail: selectedValues })
    console.log('selectedValues', selectedValues)
  }
}
