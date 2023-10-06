import { Controller } from "@hotwired/stimulus"
import Map from "../models/map"
import Activity from "../models/activity"

export default class extends Controller {
  static outlets = ['state']
  static targets = ['table', 'selected', 'tableRow', 'panel', 'checkIcon', 'crossIcon']

  static values = {
    showMapPhotos: Boolean,
    activities: { type: Array, default: [] }
  }

  connect() {
    this.stateController = this.stateOutlets[0]

    this.map = new Map('map', {
      onActivityClick: (id) => { this.toggleActivityById(id) },
      onMove: (bbox) => { this.onMapMove(bbox, this) }
    })

    this.stateController.on('activitySelected', (id) => { this.map.highlightActivity(id) })
    this.stateController.on('activityDeselected', () => {
      this.map.blurActivities();

      this.tableRowTargets.forEach((row) => {
        row.classList.add("odd:bg-gray-50", "hover:bg-purple-100")
        row.classList.remove("bg-purple-200")
      })
    })
  }

  toggleMapPhotos() {
    this.showMapPhotosValue = !this.showMapPhotosValue

    this.checkIconTarget.classList.toggle('hidden')
    this.crossIconTarget.classList.toggle('hidden')

    this.map.togglePhotos()
  }

  onMapMove(bbox, self) {
    const event = new CustomEvent('mapMoved', {
      detail: bbox
    })
    window.dispatchEvent(event)
  }
  
  activitiesValueChanged(value, previousValue) {
    if (this.map && this.stateController.selectedActivityIdValue) {
      this.map.removeAllActivitiesExcept(this.stateController.selectedActivityIdValue)
    } else if (this.map) {
      this.map.removeAllActivities()
    }

    let activities = this.activitiesValue.map((activity) => { return new Activity(activity, this.map) })
    activities = activities.filter(activity => activity.id !== this.stateController.selectedActivityIdValue)

    if (activities.length <= 0) { return }

    
    this.map.addActivities(activities)
    this.map.highlightActivity(this.stateController.selectedActivityIdValue)
    this.selectActivityRow(this.stateController.selectedActivityIdValue)
  }

  focusActivity() {
    this.map.focusActivity(this.stateController.selectedActivityIdValue)
  }

  selectActivityRow(id) {
    this.tableRowTargets.forEach((row) => {
      const idOfCurrentRow = Number(row.dataset.activityId)

      if (idOfCurrentRow === id) {
        row.classList.remove("odd:bg-gray-50", "hover:bg-purple-100")
        row.classList.add("bg-purple-200")
      } else {
        row.classList.add("odd:bg-gray-50", "hover:bg-purple-100")
        row.classList.remove("bg-purple-200")
      }
    })
  }
  
  toggleActivity(e) {
    const id = Number(e.currentTarget.dataset.activityId)
    
    this.toggleActivityById(id)
  }

  activityIsSelected(id) {
    return this.stateController.selectedActivityIdValue === id
  }

  selectActivity(id) {
    this.stateController.setSelectedActivityId(id)

    this.tableRowTargets.forEach((row) => {
      const idOfCurrentRow = Number(row.dataset.activityId)

      if (idOfCurrentRow === id) {
        row.classList.remove("odd:bg-gray-50", "hover:bg-purple-100")
        row.classList.add("bg-purple-200")
      } else {
        row.classList.add("odd:bg-gray-50", "hover:bg-purple-100")
        row.classList.remove("bg-purple-200")
      }
    })
  }

  deselectActivity(id) {
    this.stateController.clearSelectedActivityId()
  }

  // can move this out of map context
  toggleActivityById = (id) => {
    console.log('qqq', id)
    console.log(this.stateController.selectedActivityIdValue)
    if (this.activityIsSelected(id)) {
      console.log('de')
      this.deselectActivity(id)
    } else {
      console.log('se')
      this.selectActivity(id)
    }
  }

  tableTargetConnected(el) {
    console.log('before parse')
    this.activitiesValue = JSON.parse(el.dataset.activities)
    console.log('after parse')

    if (!this.stateController) { return }

    // Need to do this to ensure selected activity row stays highlighted
    // even if the activitiesValue that comes back is exactly the same 
    this.selectActivityRow(this.stateController.selectedActivityIdValue)
  }
}
