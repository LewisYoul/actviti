
import polyline from "@mapbox/polyline";
import turf from 'turf'
import L from "leaflet";
import moment from 'moment'

export default class Activity {
  activity: any;
  color: any;
  map: any;
  layer: any;
  id: string;
  photos: Array<object>;
  stravaId: string;

  constructor(activity: any, map: any) {
    this.activity = activity;
    this.map = map;
    this.layer = L.geoJSON(this.summaryGeoJSON())
    this.layer.properties = { id: activity.id }
    this.id = activity.id
    this.photos = activity.photos
    this.stravaId = activity.strava_id
  }

  update(activity: any) {
    this.activity = activity;
    this.removeFromMap()
    this.layer = L.geoJSON(this.geoJSON())
    this.addToMap()
  }

  boundingBox() {
    return turf.bbox(this.summaryGeoJSON() as any)
  }

  coordinates() {
    return polyline.decode(this.activity.map.summary_polyline)
  }

  icon() {
    return this.emojis[this.activity.activity_type.toLowerCase()]
  }

  startDateShort() {
    const options = { year: 'numeric', month: '2-digit', day: 'numeric' }
    let date = new Date(this.activity.start_date)

    return date.toLocaleDateString("en-GB", options as any)
  }

  startDateLong() {
    return moment(this.activity.start_date).format('MMM. D, YYYY')
  }

  totalElevationGain() {
    return this.activity.total_elevation_gain
  }

  movingTime() {
    const timeString = moment().startOf('day').seconds(this.activity.moving_time).format('HH:mm:ss')

    return (timeString[0] === '0') ? timeString.slice(1) : timeString
  }

  elapsedTime() {
    const timeString = moment().startOf('day').seconds(this.activity.elapsed_time).format('HH:mm:ss')

    return (timeString[0] === '0') ? timeString.slice(1) : timeString
  }

  maxSpeed() {
    return this.activity.max_speed
  }

  averageSpeed() {
    return this.activity.average_speed
  }

  maxHeartrate() {
    return this.activity.max_heartrate
  }

  averageHeartrate() {
    return this.activity.average_heartrate
  }

  // colorForDisplay () {
  //   switch(this.activity.type) {
  //     case 'Ride':
  //       return 'orange'
  //     default:
  //       return 'purple'
  //   }
  // }

  flyTo() {
    this.bringToForeground()
    this.map.flyToBounds(this.layer.getBounds(), { 'duration': 2, padding: [100, 100] });
    const renderFunc = () => { this.map.fire('viewreset') };
    this.map.on('move', renderFunc) 
    setTimeout(() => {
      this.map.off('move', renderFunc) 
    }, 2000)
    
    // this.map.fitBounds(this.boundingBox(), { padding: 80 })
  }

  // hide() {
  //   this.map.setPaintProperty(`route-${this.activity.id}`, 'line-opacity', 0.2);
  // }

  // mouseover() {
  //   if (this.map.getLayer(`route-${this.activity.id}`)) {
  //     this.map.moveLayer(`route-${this.activity.id}`);
  //     this.map.setPaintProperty(`route-${this.activity.id}`, 'line-opacity', 1);
  //     this.map.setPaintProperty(`route-${this.activity.id}`, 'line-color', '#E34A01');
  //   }
  // }

  // mouseleave() {
  //   if (this.map.getLayer(`route-${this.activity.id}`)) {
  //     this.map.setPaintProperty(`route-${this.activity.id}`, 'line-color', this.color);
  //     this.map.setPaintProperty(`route-${this.activity.id}`, 'line-opacity', 1);
  //   }
  // }

  name() {
    return this.activity.name
  }

  distance() {
    return (this.activity.distance / 1000).toFixed(1)
  }

  type() {
    switch(this.activity.activity_type) {
      case 'StandUpPaddling':
        return 'SUP'
      case 'NordicSki':
        return 'Nordic Ski'
      default:
        return this.activity.activity_type
    }

  }

  summaryGeoJSON() {
    let geojson = polyline.toGeoJSON(this.activity.summary_polyline)
    geojson.properties = {}
    geojson.properties.id = this.activity.id
    geojson.bbox = turf.bbox(geojson)
    
    return geojson
  }

  geoJSON() {
    if (!this.activity.polyline) { return undefined }

    return polyline.toGeoJSON(this.activity.polyline)
  }

  googlePolyline() {
    return this.activity.map.summary_polyline
  }

  addToMap() {
    this.layer.addTo(this.map)
  }

  removeFromMap() {
    this.map.removeLayer(this.layer)
  }

  sendToBackground() {
    this.removeFromMap()

    this.layer = L.geoJSON(this.summaryGeoJSON())
    this.addToMap()

    this.layer.setStyle({
      weight: 3,
      color: '#6B20A8',
      opacity: 0.5
    })
  }

  bringToForeground() {
    this.removeFromMap()
    // Use the more accurate polyline if it exists. This || can be removed 
    // once we change it so that the activity is always requested before loading
    // the side panel
    this.layer = L.geoJSON(this.geoJSON() || this.summaryGeoJSON())
    this.addToMap()

    this.layer.setStyle({
      weight: 3,
      color: '#FC4C01',
      opacity: 1.0
    })
    this.layer.bringToFront()
  }

  // probably encapsulate this in component?
  textColorClass() {
    switch(this.activity.activity_type) {
      case 'Snowshoe':
        return 'text-pink-800'
      case 'Run':
        return 'text-red-800'
      case 'Walk':
        return 'text-green-800'
      case 'NordicSki':
        return 'text-orange-800'
      default:
        return 'text-purple-800'
      }
    }
      
  // probably encapsulate this in component?
  bgColorClass() {
    switch(this.activity.activity_type) {
      case 'Snowshoe':
        return 'bg-pink-100'
      case 'Run':
        return 'bg-red-100'
      case 'Walk':
        return 'bg-green-100'
      case 'NordicSki':
        return 'bg-orange-100'
      default:
        return 'bg-purple-100'
    }
  }

  // popupHTML() {
  //   return (
  //     `
  //     <div class="w-full">
  //       <div class="flex justify-between">
  //         <span class="block text-base">${this.name()}</span>
  //         <div class="ml-4">
  //           <span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800">${this.type()}</span>
  //         </div>
  //       </div>
  //       <div class="flex justify-between">
  //         <span class="block text-xs text-gray-500">${this.startDate()}</span>
  //         <span class="block text-xs">${this.distance()}km</span>
  //       </div>
  //     </div>
  //     `
  //   )
  // }

  // removeFromMap() {
  //   const id = `route-${this.activity.id}`

  //   if (this.map.getLayer(id)) { this.map.removeLayer(id) }
  //   if (this.map.getSource(id)) { this.map.removeSource(id) }
  // }
}