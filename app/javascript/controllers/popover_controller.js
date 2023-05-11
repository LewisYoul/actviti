import { Controller } from "@hotwired/stimulus"
import L from 'leaflet'

export default class extends Controller {
  static targets = ['text', 'popover']

  static values = {
    text: String
  }

  connect() {
    L.DomEvent.disableClickPropagation(this.popoverTarget)
    L.DomEvent.disableScrollPropagation(this.popoverTarget)
  }
  
  toggle() {
    if (this.popoverTarget.classList.contains('hidden')) {
      this.popoverTarget.classList.remove('hidden')
    } else {
      this.popoverTarget.classList.add('hidden')
    }
  }
  
  close(e) {
    const contains = this.element.contains(e.target)
    
    // isTrusted tells us whether it was a user initiated click or not
    // We are programatically clicking the search button so we don't want that
    // click to close the popover.
    if (!contains && e.isTrusted) {
      this.popoverTarget.classList.add('hidden')
    }
  }
}
