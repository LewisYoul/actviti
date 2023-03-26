import { Controller } from "@hotwired/stimulus"
import { debounce } from 'debounce'
import Litepicker from "litepicker"
import axios from "axios"
export default class extends Controller {
  static targets = [
    'search',
    'searchButton',
    'typeButton',
    'checkbox',
    'pagination',
    'nextPageButton',
    'previousPageButton',
    'filter'
  ]

  static values = {
    previousPage: Number,
    page: Number,
    nextPage: Number,
    perPage: Number
  }

  initialize() {
    this.searchAsIMove = false
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

    const selectedTypesCount = activityTypes.length

    if (selectedTypesCount > 0) {
      this.typeButtonTarget.innerText = `Type (${selectedTypesCount})`
    } else {
      this.typeButtonTarget.innerText = 'Type'
    }
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

  toggleSearchAsIMove(e) {
    this.searchAsIMove = e.target.checked
  }

  mapMoved(e) {
    console.log('infil')
    if (!this.searchAsIMove) { return }
    
    const bboxString = e.detail
    
    console.log('upfil')
    this.updateFilters({ bbox: bboxString })
  }

  clearFilters() {
    this.filters = { page: 1, per_page: this.perPageValue }
    this.searchTarget.value = ''
    const params = this.buildParams(this.filters)
    this.searchButtonTarget.href = `/activities?${params}`
    this.searchButtonTarget.click()
    this.picker.clearSelection()
    document.getElementById('datepicker').innerText = "Date"


    this.typeButtonTarget.innerText = 'Type'
    this.clearCheckboxes()

    this.filterTargets.forEach(filterTarget => {
      const event = new CustomEvent('resetFilters')

      filterTarget.dispatchEvent(event)
    })
  }

  buildParams(data) {
    const params = new URLSearchParams()

    Object.entries(data).forEach(([key, value]) => {
      if (Array.isArray(value)) {
          value.forEach(value => params.append(`${key}[]`, value.toString()))
      } else {
          params.append(key, value.toString())
      }
    });

    return params.toString()
  }

  updateFilters(newFilters) {
    let updatedFilters = Object.assign({}, this.filters)
    updatedFilters = Object.assign(updatedFilters, newFilters)

    this.filters = updatedFilters
    console.log('apfil')
    this.applyFilters()
  }

  refreshActivities() {
    axios.get('/activities/refresh')
      .then(() => {
        console.log('boop', this.filtersOutlets)
        this.clearFilters()
      })
      .catch(console.error)
  }
}
