import * as React from 'react'
import L from 'leaflet'        
import Actviti from '../clients/Actviti';
import Activity from '../models/Activity';
import ActivityList from './ActivityList';
import Panel from './Panel';
import clickOutside from '../utils/clickOutside';

function Map() {
  const initialLoadingMessage = 'Fetching your activities';
  const importingFromStravaMessage = 'Importing your activities from Strava. This may take a moment...';
  const [activities, setActivities] = React.useState([])
  const [map, setMap] = React.useState()
  const [isLoading, setIsLoading] = React.useState(true)
  const [showFilters, setShowFilters] = React.useState(false)
  const [filters, setFilters] = React.useState({})
  const [loadingMessage, setLoadingMessage] = React.useState(initialLoadingMessage)
  const [selectedActivity, setSelectedActivity] = React.useState()
  const modalRef = React.useRef(null)

  clickOutside(modalRef, () => { setShowFilters(false) })

  React.useEffect(() => {
    const newMap = L.map('map').setView([51.505, -0.09], 13);
    const accessToken = 'pk.eyJ1IjoibGV3aXN5b3VsIiwiYSI6ImNqYzM3a3lndjBhOXQyd24zZnVleGh3c2kifQ.qVH2-BA02t3p62tG72-DZA';

    L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 18,
      tileSize: 512,
      id: 'mapbox/streets-v11',
      zoomOffset: -1,
      accessToken: accessToken
    }).addTo(newMap);

    setMap(newMap)

    const searchParams = new URLSearchParams(window.location.search)

    if (searchParams.get('first_login')) {
      importActivities(newMap)
    } else {
      fetchActivities(newMap)
    }
  }, [])

  React.useEffect(() => {
    if (activities.length == 0) { return }

    activities.forEach(activity => activity.removeFromMap())
    activities.forEach(activity => activity.addToMap())
    const fg = L.featureGroup(activities.map(activity => activity.layer))
    map?.flyToBounds(fg.getBounds(), { duration: 2 })

  }, [activities])

  React.useEffect(() => {
    const nonSelectedActivities = activities.filter((activity) => {
      return activity !== selectedActivity      
    })

    nonSelectedActivities.forEach((activity) => { activity.sendToBackground() })

    if (selectedActivity) { selectedActivity.flyTo() }

    map?.invalidateSize()
  }, [selectedActivity])

  const fetchActivities = (newMap) => {
    setLoadingMessage(initialLoadingMessage)

    Actviti.activities()
      .then(res => {
        const activityInstances = res.data.map((activity) => { return new Activity(activity, newMap, selectActivity) })

        setActivities(activityInstances)
        setIsLoading(false)
      })
      .catch(console.error)
  }

  const importActivities = (newMap) => {
    setLoadingMessage(importingFromStravaMessage)

    Actviti.importActivities()
      .then(res => {
        removeSearchParamsFromURL()
        fetchActivities(newMap)
      })
      .catch(console.error)
  }

  const removeSearchParamsFromURL = () => {
    window.history.pushState({}, document.title, "/");
  }

  const selectActivity = (activity) => {
    if (selectedActivity) {
      if (selectedActivity === activity) {
        setSelectedActivity(undefined);
      } else {
        setSelectedActivity(activity);
      }
    } else {
      setSelectedActivity(activity);
    }
  }

  const closePanel = () => {
    selectActivity(undefined)
  }

  const refreshActivities = () => {
    setLoadingMessage(importingFromStravaMessage)
    setIsLoading(true)
    closePanel()

    Actviti.refreshActivities()
      .then(() => fetchActivities(map))
      .catch(console.error)
  }

  const showFilterModal = () => {
    setShowFilters(true)
  }

  const hideFilterModal = () => {
    setShowFilters(false)
  }

  const refreshButton = () => {
    if (isLoading) return null

    return (
      <button onClick={refreshActivities} className="shadow-md absolute m-4 z-500 top-0 right-0 whitespace-nowrap inline-flex items-center justify-center px-2 py-1 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-white hover:bg-gray-100 text-purple-600">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
        <span className="ml-1">Refresh Activities</span>
      </button>
    )
  }

  const filtersButton = () => {
    if (isLoading) return null

    return (
      <button onClick={showFilterModal} className="shadow-md absolute m-4 z-500 bottom-0 left-0 whitespace-nowrap inline-flex items-center justify-center px-2 py-1 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-white hover:bg-gray-100 text-purple-600">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
        </svg>
        <span className="ml-1">Filters</span>
      </button>
    )
  }

  const activityList = () => {
    return (
      <ActivityList
        loadingMessage={loadingMessage}
        isLoading={isLoading}
        activities={activities}
        selectActivity={selectActivity}
        selectedActivity={selectedActivity}
      />
    )
  }

  const filtersModal = () => {
    if (!showFilters) { return null }

    return (
      <div className="relative z-600" aria-labelledby="modal-title" role="dialog" aria-modal="true">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"></div>

        <div className="fixed z-10 inset-0 overflow-y-auto">
          <div className="flex items-end sm:items-center justify-center min-h-full p-4 text-center sm:p-0">
            <div ref={modalRef} className="relative bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:max-w-sm sm:w-full sm:p-6">
              <div className="w-full">
                <label for="name">Name</label>
                <input onChange={(e) => { setFilterValue('name', e.target.value) }} type="text" name="name" id="name" className="shadow-sm border focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md px-2 py-2"></input>
              </div>
              <div className="mt-5 flex justify-between">
                <button type="button" className="py-2 text-base font-medium underline sm:text-sm">Clear all</button>
                <button type="button" className="rounded-md border border-transparent shadow-sm px-4 py-2 bg-purple-600 text-base font-medium text-white hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 sm:text-sm">Apply</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }
                            
  return (
      <div className="w-full flex flex-col justify-end">
        {filtersModal()}
        <div className="w-full h-full flex">
          <div className="h-full w-full flex-1" id="map">
            {refreshButton()}
            {filtersButton()}
          </div>
          {selectedActivity ? 
            <Panel activity={selectedActivity} closePanel={closePanel}/>
          : null}
        </div>
        <div id="listContainer" className="overflow-auto h-96 max-h-96">
          {activityList()}
        </div>
      </div>
  )                   
}                                                       
                                        
// Use it if you don't plan to use "remount"                
// document.addEventListener('DOMContentLoaded', () => {     
//   ReactDOM.render(<Map />, document.getElementById('map'))                  
// })                                                    
                                                        
export default Map