import { Controller } from "@hotwired/stimulus"
import { debounce } from 'debounce'
import Litepicker from "litepicker"
export default class extends Controller {
  static targets = ['search', 'searchButton', 'checkbox', 'pagination', 'nextPageButton', 'previousPageButton']

  static values = {
    previousPage: Number,
    page: Number,
    nextPage: Number,
    perPage: Number
  }

  initialize() {
    this.filters = {
      name: '',
      activity_types: []
    }
  }

  connect() {
    console.log('filters controller')

    this.picker = new Litepicker({
      element: document.getElementById('datepicker'),
      singleMode: false,
      numberOfMonths: 2,
      numberOfColumns: 2,
      resetButton: true,
      position: 'top left',
      setup: (picker) => {
        picker.on('selected', (from, to) => {
          const fromString = from.dateInstance.toLocaleDateString(from.lang)
          // some action
          console.log(from, to)
          if (from) {
            this.filters.start_date = fromString
          }

          const toString = to.dateInstance.toLocaleDateString(to.lang)

          if (to) {
            this.filters.end_date = toString
          }

          document.getElementById('datepicker').innerText = `${fromString} - ${toString}`
          this.applyFilters()
        });

        picker.on('clear:selection', () => {
        });
      },
    })
  }

  selectPerPage(e) {
    console.log(e.target.value)

    const perPage = Number(e.target.value)

    this.filters.per_page = perPage
    this.filters.page = 1
    this.applyFilters()
  }

  paginationTargetConnected(el) {
    this.previousPageValue = Number(el.dataset.previousPage)
    this.pageValue = Number(el.dataset.page)
    this.nextPageValue = Number(el.dataset.nextPage)
    this.perPageValue = Number(el.dataset.perPage)

    if (this.hasPreviousPageButtonTarget) {
      const prevPageParams = this.buildParams(Object.assign({}, this.filters, { page: this.previousPageValue, per_page: this.perPageValue }))
      this.previousPageButtonTarget.href = `/activities?${prevPageParams}`
    }

    if (this.hasNextPageButtonTarget) {
      const nextPageParams = this.buildParams(Object.assign({}, this.filters, { page: this.nextPageValue, per_page: this.perPageValue }))
      this.nextPageButtonTarget.href = `/activities?${nextPageParams}`
    }
  }

  pageValueChanged() {
    console.log('page val', this.pageValue)
  }

  checkboxChanged() {
    let activityTypes = []

    this.checkboxTargets.forEach((checkbox) => {
      if (checkbox.checked) {
        activityTypes = activityTypes.concat(checkbox.value)
      }
    })

    this.filters.activity_types = activityTypes
  }

  search = debounce((event) => {
    this.filters.name = event.target.value

    this.applyFilters()
  }, 400)

  applyFilters() {
    const params = this.buildParams(this.filters)
    this.searchButtonTarget.href = `/activities?${params}`
    this.searchButtonTarget.click()
  }

  clearCheckboxes() {
    this.checkboxTargets.forEach((checkbox) => { checkbox.checked = false })
    this.checkboxChanged()
  }

  selectAllCheckboxes() {
    this.checkboxTargets.forEach((checkbox) => { checkbox.checked = true })
    this.checkboxChanged()
  }

  clearFilters() {
    this.filters = { page: 1, per_page: this.perPageValue }
    this.searchTarget.value = ''
    const params = this.buildParams(this.filters)
    this.searchButtonTarget.href = `/activities?${params}`
    this.searchButtonTarget.click()
    this.picker.clearSelection()
    document.getElementById('datepicker').innerText = "Date"
  }

  buildParams(data) {
    const params = new URLSearchParams()
    console.log('data', data)
    Object.entries(data).forEach(([key, value]) => {
      if (Array.isArray(value)) {
          value.forEach(value => params.append(`${key}[]`, value.toString()))
      } else {
          params.append(key, value.toString())
      }
    });

    return params.toString()
  }
}
