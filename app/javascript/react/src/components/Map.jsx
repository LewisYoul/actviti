import React from "react";
import { default as MapModel } from "../../../models/map";
import Activity from "../../../models/activity";
import ActivitiesTable from "./ActivitiesTable"
import ActivityPanel from "./ActivityPanel"
import RangeSlider from "./RangeSlider";
import debounce from 'debounce'

const Map = ({ currentUser }) => {
  const [activities, setActivities] = React.useState([])
  const [selectedActivity, setSelectedActivity] = React.useState(null)
  const [map, setMap] = React.useState()
  const [filters, setFilters] = React.useState({
    bbox: "-189.07650860722026,-57.75813080506425,211.2983710668277,80.18612440208034"
  })
  const prevSelectedActivityRef = React.useRef(null)
  const prevFiltersRef = React.useRef(null)

  React.useEffect(() => {
    setMap(
      new MapModel('map', {
        onActivityClick: (activity) => {
          activity.id === prevSelectedActivityRef.current?.id ? setSelectedActivity(null) : setSelectedActivity(activity)
        },
        onMove: (newBbox) => {
          console.log('newBbox', newBbox)
          setFilters({ ...prevFiltersRef.current, bbox: newBbox })
        }
      })
    )

    window.addEventListener('activitySelected', (event) => {
      setSelectedActivity(event.detail.activity)
    })
  }, [])

  React.useEffect(() => {
    if (!map) { return }

    // This is required so that onMove knows what the previous selectedActivity was
    // For reasons I don't understand the filters are never updated in that function
    prevFiltersRef.current = filters

    fetchActivities()
  }, [map, filters])

  React.useEffect(() => {
    if (!map) { return }

    // This is required so that onMove knows what the previous selectedActivity was
    // For reasons I don't understand the selectedActivity is never updated in that function
    prevSelectedActivityRef.current = selectedActivity

    map.highlightActivity(selectedActivity?.id)
  }, [map, selectedActivity])


  React.useEffect(() => {
    if (!map) { return }

    if (selectedActivity) {
      map.highlightActivity(selectedActivity.id)
    }
  }, [map, selectedActivity])


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

  const updateNameFilter = debounce((event) => {
    const name = event.target.value

    setFilters({ ...filters, name })
  }, 400)

  const updateDistanceFilter = ({ min, max }) => {
    setFilters({ ...filters, min_distance: min, max_distance: max })
  }

  const updateDurationFilter = ({ min, max }) => {
    setFilters({ ...filters, min_duration: min, max_duration: max })
  }

  return(
    <div className="flex flex-col flex-1">
      <div className="h-full w-full flex">
        <div className="h-[calc(((100vh-48px)/3)*2)] w-full relative">
          {currentUser.plan.level === "free" && (
            <div className="absolute z-500 flex justify-center w-full">
              <div className="bg-white px-2 py-1 mt-4 text-sm rounded-md">
                You're on the free plan which limits the activities you can see. Upgrade to view all of your activities!
              </div>
            </div>
          )}
          {activities.length >= 100 && (
            <div className="absolute z-500 flex justify-center w-full">
              <div className="bg-white px-2 py-1 mt-4 text-sm rounded-md">
                There are more than 100 activities in this area. Try refining your search.
              </div>
            </div>
          )}
          <div className="overflow-auto md:overflow-visible w-full absolute mb-1 px-1 md:ml-1 md:mb-2 z-500 bottom-0 left-0 flex" id="filters">
            <input onChange={updateNameFilter} className="shadow-md whitespace-nowrap inline-flex items-center rounded-md justify-center px-2 py-1 border border-transparent shadow-sm bg-white hover:bg-gray-100 focus:outline-none"></input>

            <RangeSlider
              label="Distance"
              min={0}
              max={80}
              step={2}
              decimalPlaces={0}
              unit="km"
              onChange={updateDistanceFilter}
            />

            <RangeSlider
              label="Duration"
              min={0}
              max={6}
              step={0.5}
              decimalPlaces={1}
              unit="h"
              onChange={updateDurationFilter}
            />
            {/* <%= render partial: 'shared/map_filters/multi_select_filter', locals: { label: 'Type', filter_key: 'activity_types', items: @activity_types } %>

            <button id="datepicker" className="ml-1 rounded-md shadow-md py-2 px-2 cursor-pointer bg-white text-xs">Date</button>

            <%= render partial: 'shared/map_filters/range_slider_filter', locals: { label: 'Distance', filter_key: 'distance', min: 0, max: 80, step: 2, decimal_places: 0, parser: 'km' } %>
            <%= render partial: 'shared/map_filters/range_slider_filter', locals: { label: 'Duration', filter_key: 'duration', min: 0, max: 6, step: 0.5, decimal_places: 1, parser: 'hours' } %>
            <%= render partial: 'shared/map_filters/multi_select_filter', locals: { label: 'Group', filter_key: 'group_ids', items: @groups_for_filter } %>

            <%= link_to '', activities_path, class: "", data: { filters_target: "searchButton", turbo_stream: "" } %> */}
          </div>
          <div id="map" className="h-full w-full flex-1"></div>
        </div>
        {selectedActivity && <ActivityPanel activity={selectedActivity} />}
      </div>

      <ActivitiesTable activities={activities} selectedActivity={selectedActivity}/>
    </div>
  )
}

export default Map;