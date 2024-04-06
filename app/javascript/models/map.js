import L from 'leaflet'
import 'leaflet.markercluster'
import 'leaflet.markercluster/dist/MarkerCluster.css'
// import 'leaflet.markercluster/dist/MarkerCluster.Default.css'

export default class Map {
  constructor(id, options) {
    this.showMapPhotos = true
    this.options = options
    this.map = L.map(id, { attributionControl: false, zoomSnap: 0, wheelPxPerZoomLevel: 2 }).setView([51.505, -0.09], 2)
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

  togglePhotos() {
    if (this.showMapPhotos) {
      this.map.removeLayer(this.markerLayer)
    } else {
      this.map.addLayer(this.markerLayer)
    }

    this.showMapPhotos = !this.showMapPhotos
  }

  addActivities(activities) {
    this.removeAllActivities()
    this.activities = activities
    this.layer.addData(activities.map((activity) => { return activity.summaryGeoJSON() }))

    const markerCluserGroup = L.markerClusterGroup({
      zoomToBoundsOnClick: false,
      iconCreateFunction: function(cluster) {
        console.log(cluster.getAllChildMarkers())
        const firstMarker = cluster.getAllChildMarkers()[0]
        const markerCount = cluster.getChildCount()
        const markerCountForDisplay = markerCount > 99 ? 99 : markerCount 

        const clusterHtml = `
        <div class="relative">
          <div class="bg-white absolute -top-1 -right-1 rounded-full w-4 h-4">
            <div class="flex items-center justify-center w-full h-full">
              <span class="text-xs">${markerCountForDisplay}</span>
            </div>
          </div>
          <img src="${firstMarker.options.icon.options.iconUrl}" style="width: 40px; height: 40px; border-radius: 5px; border: 2px solid white; box-shadow: 0px 0px 5px 0px rgba(0,0,0,0.75);" class="object-cover"/>
        </div>
        `
        return L.divIcon({ html: clusterHtml, iconSize: [40, 40] });
      }
    });

    this.activities.forEach(activity => {
      activity.photos.forEach(photo => {
        if (photo.latlng) {
          // console.log('url', photo.thumbnail_url)
          const markerHtml = `<img src="${photo.thumbnail_url}" style="width: 40px; height: 40px; border-radius: 5px; border: 2px solid white; box-shadow: 0px 0px 5px 0px rgba(0,0,0,0.75);" class="object-cover"/>`
          const icon = L.divIcon({
            html: markerHtml,
            iconUrl: photo.thumbnail_url,
            iconSize:     [40, 40], // size of the icon
          });
  
          const marker = L.marker(photo.latlng, { icon });

          markerCluserGroup.addLayer(marker)
        }
      })
    })

    this.markerLayer = markerCluserGroup

    if (this.showMapPhotos) {
      this.map.addLayer(markerCluserGroup)
    }

    this.layer.setStyle({
      weight: 3,
      color: '#6B20A8',
      opacity: 0.5
    })

    this.layer.on('click', (e) => {
      const activityId = e.layer.feature.geometry.properties.id
      const clickedActivity = this.activities.find(activity => activity.id === activityId)

      this.options.onActivityClick(clickedActivity)
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

  flyToBounds() {
    this.map.flyToBounds(this.layer.getBounds(), { duration: 1 })
  }

  removeAllActivities() {
    this.activities = []
    this.layer.remove()
    this.layer = L.geoJSON().addTo(this.map)
    this.removeMarkerLayer()
  }
  
  removeMarkerLayer() {
    if (this.markerLayer) {
      this.markerLayer.clearLayers()
      this.markerLayer.remove()
    }
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