import React from 'react'
import Activity from '../../../models/activity'

const ActivityPanel = ({ activity }) => {
  const [localActivity, setLocalActivity] = React.useState()

  React.useEffect(() => {
    // Clear the panel of previous activity if there is one
    setLocalActivity(null)

    if (!activity) { return }

    fetch(`activities/${activity.id}.json`)
    .then((res) => {
      res.json().then(returnedActivity => {
        setLocalActivity(new Activity(returnedActivity))
      })
      .catch(console.error)
    })
  }, [activity])

  const deselectActivity = () => {
    const event = new CustomEvent('activitySelected', { detail: { activity: null } })

    window.dispatchEvent(event)
  }

  return (
    <div className="h-full overflow-auto px-6 py-6 bg-white z-500 w-[400px] max-w-[400px]">
      <button onClick={deselectActivity} className="absolute right-6 text-gray-400 hover:text-gray-500">
        <span className="sr-only">Close panel</span>
        <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" ariaHidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
        </button>
      {!localActivity && (
        <svg xmlns="http://www.w3.org/2000/svg" class="block m-auto" width="50px" height="50px" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid">
          <circle cx="50" cy="50" fill="none" stroke="#8140b6" strokeWidth="10" r="35" strokeDasharray="164.93361431346415 56.97787143782138">
            <animateTransform attributeName="transform" type="rotate" repeatCount="indefinite" dur="1s" values="0 50 50;360 50 50" keyTimes="0;1">
            </animateTransform>
          </circle>
        </svg>
      )}
      {localActivity && (
        <div>
          <div className="flex items-start justify-between">
            <div>
              <span className="ml-2 text-sm text-gray-700">{localActivity.startDateShort()}</span>
            </div>
          </div>
          <div className="group flex items-center cursor-pointer">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
            </svg>
            <h2 className="group-hover:underline ml-1 text-lg font-medium text-gray-900" id="slide-over-title">
              {localActivity.name()}
            </h2>
          </div>
      
          {/* <% if @localActivity.deleted_in_strava? %>
            <div className="rounded-md bg-red-50 p-2 mt-2">
              <div className="flex">
                <div className="ml-3">
                  <p className="text-sm font-medium text-red-800">This localActivity has been deleted in Strava</p>
                </div>
              </div>
            </div>
          <% end %> */}
      
          {localActivity.photos.length > 0 && (
            <div className="mt-3">
              <div className="w-full flex h-40 overflow-x-auto">
                {localActivity.photos.map(photo => {
                  if (!photo.url) { return }

                  return (
                    <img key={`photo-${photo.id}`} src={photo.url} className="cursor-pointer flex-none object-cover w-40 h-40 hover:opacity-90 inline" />
                  )
                })}
                  {/* <% next unless photo.url %>
                  <%= image_tag(photo.url, { class: "cursor-pointer flex-none object-cover w-40 h-40 hover:opacity-90 inline", data: { carousel_target: 'image', action: 'click->carousel#open' } }) %>
                <% end %> */}
              </div>
            </div>
          )}
      
          <div className="flex justify-between mt-3">
            <div>
              <div>
                <span className="text-2xl">{localActivity.distance()}</span>
                <span className="text-md">km</span>
              </div>
              <span className="block text-gray-500 text-xs">Distance</span>
            </div>
            <div>
              <div>
                <span className="text-2xl">{localActivity.movingTime()}</span>
                <span className="text-md">hours</span>
              </div>
              <span className="block text-gray-500 text-xs">Moving Time</span>
            </div>
            <div>
              <div>
                <span className="text-2xl">{localActivity.totalElevationGain()}</span>
                <span className="text-md">m</span>
              </div>
              <span className="block text-gray-500 text-xs">Elevation</span>
            </div>
          </div>
          <div>
            <table className="mt-3 min-w-full divide-y divide-gray-300">
              <tbody className="bg-white">
                <tr>
                  <td className="whitespace-nowrap pr-3 text-sm font-light">Elapsed Time</td>
                  <td className="whitespace-nowrap px-2 text-sm font-medium text-gray-900">{localActivity.elapsedTime()} <span className="text-xs font-light">hours</span></td>
                </tr>
                <tr>
                  <td className="whitespace-nowrap pr-3 text-sm font-light">Max Speed</td>
                  <td className="whitespace-nowrap px-2 text-sm font-medium text-gray-900">{localActivity.maxSpeed()} <span className="text-xs font-light">km/hr</span></td>
                </tr>
                <tr>
                  <td className="whitespace-nowrap pr-3 text-sm font-light">Average Speed</td>
                  <td className="whitespace-nowrap px-2 text-sm font-medium text-gray-900">{localActivity.averageSpeed()}<span className="text-xs font-light">km/hr</span></td>
                </tr>
                {localActivity.maxHeartrate() && (
                  <tr>
                    <td className="whitespace-nowrap pr-3 text-sm font-light">Max Heartrate</td>
                    <td className="whitespace-nowrap px-2 text-sm font-medium text-gray-900">{localActivity.maxHeartrate()} <span className="text-xs font-light">bpm</span></td>
                  </tr>
                )}
                {localActivity.averageHeartrate() && (
                  <tr>
                    <td className="whitespace-nowrap pr-3 text-sm font-light">Average Heartrate</td>
                    <td className="whitespace-nowrap px-2 text-sm font-medium text-gray-900">{localActivity.averageHeartrate()} <span className="text-xs font-light">bpm</span></td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
      
          {/* <h1 className="mt-3">Groups</h1>
      
          <%= turbo_frame_tag "activity_#{@activity.id}_groups" do %>
            <% @activity.groups.each do |group| %>
              <span className="font-base inline-flex items-center rounded-full bg-purple-100 px-2.5 py-0.5 text-xs font-medium text-purple-800"><%= group.name %></span>
            <% end %>
          <% end %> */}
      
          {/* <div data-controller="lazyModal" data-lazyModal-path-value="<%= groupings_groups_path(activity_id: @activity.id) %>">
            <div data-lazyModal-target="lazyModal" className="hidden fixed w-screen h-screen bg-gray-800 bg-opacity-75 top-0 left-0 z-1100">
              <div className="flex justify-center w-full h-full">
                <div className="relative bg-white rounded-md bg-opacity-100 w-[720px] h-[525px] mt-6">
                  <svg data-action="click->lazyModal#close" className="text-gray-600 hover:text-gray-400 absolute top-0 right-0 cursor-pointer w-12 h-12 pr-4 pt-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-6 h-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
      
                  <div data-lazyModal-target="wrapper" className="h-full">
                    <%= turbo_frame_tag "lazyModal", src: groupings_groups_path(activity_id: @activity.id), loading: 'lazy', data: { lazyModal_target: 'turboFrame' } %>
                  </div>
      
                </div>
              </div>
            </div>
      
            <button className="font-base inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">Add +</button>
          </div> */}
        </div> 
      )}
    </div>
  )
}

export default ActivityPanel;