import L from 'leaflet'

export default class Map {
  constructor(id, options) {
    this.options = options
    this.map = L.map(id, { attributionControl: false }).setView([51.505, -0.09], 13)
    console.log('bbox', this.map.getBounds().toBBoxString())
    this.accessToken = 'pk.eyJ1IjoibGV3aXN5b3VsIiwiYSI6ImNqYzM3a3lndjBhOXQyd24zZnVleGh3c2kifQ.qVH2-BA02t3p62tG72-DZA';
    
    this.shouldFlytoActivities = true
    this.isFirstMove = true

    this.map.whenReady(() => {
      this.map.on('moveend', () => {
        if (this.isFirstMove) {
          this.isFirstMove = false
        } else {
          console.log('going')
          this.disableFlyingToActivities()
          this.options.onMove(this.map.getBounds().toBBoxString())
        }
      })
    })

    L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 18,
      tileSize: 512,
      id: 'mapbox/streets-v11',
      zoomOffset: -1,
      accessToken: this.accessToken
    }).addTo(this.map);

    this.layer = L.geoJSON().addTo(this.map)
    this.activities = []
  }

  enableFlyingToActivities() {
    this.shouldFlytoActivities = true
  }

  disableFlyingToActivities() {
    this.shouldFlytoActivities = false
  }

  addActivities(activities) {
    console.log('adding', activities)
    console.log('to', this.activities)
    const activitiesToAdd = activities.concat(this.activities)
    this.removeAllActivities()
    this.activities = activitiesToAdd
    this.layer.addData(activitiesToAdd.map((activity) => { return activity.summaryGeoJSON() }))

    this.layer.setStyle({
      weight: 3,
      color: '#6B20A8',
      opacity: 1.0
    })

    this.layer.on('click', (e) => {
      const activityId = e.layer.feature.geometry.properties.id
      console.log('actid', activityId)
      this.options.onActivityClick(activityId)
    })

    if (this.shouldFlytoActivities) {
      this.map.flyToBounds(this.layer.getBounds(), { duration: 1 })
    }
  }

  // TODO: Combine the map.js & map_controller.js to be responsible for map state? e.g. map_state_controller.js
  removeAllActivitiesExcept(activityId) {
    const activityToKeep = this.activities.find(activity => activity.id === activityId)

    this.removeAllActivities()
    this.addActivities([activityToKeep])
  }

  removeAllActivities() {
    this.activities = []
    this.layer.remove()
    this.layer = L.geoJSON().addTo(this.map)
  }

  highlightActivity(activityId) {
    this.layer.eachLayer((layer) => {
      const id = layer.feature.geometry.properties.id

      if (id === activityId) {
        layer.setStyle({
          weight: 3,
          color: '#FC4C01',
          opacity: 1.0
        })

        layer.bringToFront()
      } else {
        layer.setStyle({
          weight: 3,
          color: '#6B20A8',
          opacity: 0.5
        })
      }
    })
  }

  focusActivity(activityId) {
    this.fitToContainer()

    this.layer.eachLayer((layer) => {
      const id = layer.feature.geometry.properties.id

      if (id === activityId) {
        this.map.flyToBounds(layer.getBounds(), { duration: 1, padding: [10, 10] })
      }
    })
  }

  blurActivities() {
    this.layer.eachLayer((layer) => {
      layer.setStyle({
        weight: 3,
        color: '#6B20A8',
        opacity: 0.5
      })
    })
  }

  fitToContainer() {
    this.map.invalidateSize()
  }
}