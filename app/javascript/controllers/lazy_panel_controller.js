import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  static outlets = ['state']
  static targets = ['wrapper']

  connect() {
    this.stateController = this.stateOutlets[0]

    this.stateController.on('activitySelected', (id) => {
      console.log(3)
      this.open(id)
    })
    this.stateController.on('activityDeselected', () => { this.close() })
  }

  open(activityId) {
    console.log(3)
    this.wrapperTarget.innerHTML = `<turbo-frame id="lazyPanel" loading="lazy" id="lazyModal" src="/activities/${activityId}"></turbo-frame>`
    this.element.classList.remove('hidden')
  }
  
  close() {
    this.element.classList.add('hidden')
    this.wrapperTarget.innerHTML = ""
    this.stateController.clearSelectedActivityId()
  }
}
