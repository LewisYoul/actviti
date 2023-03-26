import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  static values = {
    selectedActivityId: Number
  }

  initialize() {
    this.valueChanges = {}
  }

  connect() {
    console.log('state')
  }

  setSelectedActivityId(activityId) {
    console.log(1, activityId)
    this.selectedActivityIdValue = activityId
  }

  clearSelectedActivityId() {
    this.setSelectedActivityId(undefined)
  }

  selectedActivityIdValueChanged(newActivityId, previousActivityId) {
    console.log(2, newActivityId, this.valueChanges)
    if (!this.valueChanges) { return }
    if (newActivityId) {
      if (!this.valueChanges['activitySelected']) { return }

      this.valueChanges['activitySelected'].forEach((callback) => {
        callback(newActivityId)
      })
    } else {
      if (!this.valueChanges['activityDeselected']) { return }

      this.valueChanges['activityDeselected'].forEach((callback) => {
        callback()
      })
    }
  }

  on(valueChange, callback) {
    if (this.valueChanges[valueChange]) {
      this.valueChanges[valueChange].push(callback)
    } else {
      this.valueChanges[valueChange] = [callback]
    }
  }
}
