import React from "react";
import { default as MapModel } from "../../../models/map";
import Activity from "../../../models/activity";
import ActivitiesTable from "./ActivitiesTable"
import ActivityPanel from "./ActivityPanel"

const Map = () => {
  const [activities, setActivities] = React.useState([])
  const [selectedActivity, setSelectedActivity] = React.useState(null)
  const [map, setMap] = React.useState()
  const [filters, setFilters] = React.useState({
    bbox: "-0.20547866821289065,51.468766318140894,0.0254058837890625,51.54121061341155"
  })

  React.useEffect(() => {
    setMap(
      new MapModel('map', {
        onActivityClick: () => {},
        onMove: (newBbox) => {
          console.log('bbox', newBbox)

          setFilters({ bbox: newBbox })
        }
      })
    )

    window.addEventListener('activitySelected', (event) => {
      setSelectedActivity(event.detail.activity)
    })
  }, [])

  React.useEffect(() => {
    if (!map) { return }

    fetchActivities()
  }, [map, filters])

  React.useEffect(() => {
    if (!map) { return }

    map.highlightActivity(selectedActivity?.id)
  }, [map, selectedActivity])


  React.useEffect(() => {
    if (!map) { return }

    if (selectedActivity) {
      map.highlightActivity(selectedActivity.id)
    }
  }, [map, activities, selectedActivity])


  const fetchActivities = () => {
    fetch(`activities.json?${buildParams()}`)
      .then((res) => {
        res.json().then(returnedActivities => {
          const activityModels = returnedActivities.map((activity) => {
            return new Activity(activity);
          });

          map.addActivities(activityModels)
          setActivities(activityModels)
        })
      })
  }

  const buildParams = () => {
    const params = new URLSearchParams()

    Object.entries(filters).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        value.forEach(value => params.append(`${key}[]`, value.toString()))
      } else {
        params.append(key, value.toString())
      }
    });

    return params.toString()
  }

  return(
    <div className="flex flex-col flex-1">
      <div className="h-full w-full flex">
        <div id="map" className="h-full w-full flex-1">

        </div>
        {selectedActivity && <ActivityPanel activity={selectedActivity} />}
      </div>

      <ActivitiesTable activities={activities} selectedActivity={selectedActivity}/>
    </div>
  )
}

export default Map;