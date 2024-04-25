import React from 'react'

const ActivitiesTable = ({ activities, selectedActivity }) => {
  const toggleActivity = (activity) => {
    let event;
    
    if (activity.id === selectedActivity?.id) {
      event = new CustomEvent('activitySelected', { detail: { activity: null } })
    } else {
      event = new CustomEvent('activitySelected', { detail: { activity } })
    }

    window.dispatchEvent(event)
  }

  return (
    <div className="min-h-[calc((100vh-48px)/3)] max-h-[calc((100vh-48px)/3)] relative">
      <div className="flex flex-col flex-none h-full">
        <div className="w-full flex bg-white">
          <div className="whitespace-nowrap overflow-hidden py-2 pl-4 pr-3 text-left text-xs md:text-sm font-medium text-gray-400 sm:pl-6 w-4/12">NAME</div>
          <div className="whitespace-nowrap overflow-hidden px-2 py-2 text-left text-xs md:text-sm font-medium text-gray-400 w-3/12 md:w-2/12">DATE</div>
          <div className="whitespace-nowrap overflow-hidden px-2 py-2 text-left text-xs md:text-sm font-medium text-gray-400 w-2/12">TYPE</div>
          <div className="whitespace-nowrap overflow-hidden px-2 py-2 text-left text-xs md:text-sm font-medium text-gray-400 w-2/12">DIST (km)</div>
          <div className="hidden md:block whitespace-nowrap overflow-hidden px-2 py-2 pr-4 text-left text-xs md:text-sm font-medium text-gray-400 w-2/12">TIME</div>
        </div>
        <div className="flex-1 overflow-auto">
          {
            activities.map(activity => {
              return (
                <div key={activity.id} onClick={() => { toggleActivity(activity) }} className={`cursor-pointer ${activity.id === selectedActivity?.id ? 'bg-purple-200' : 'odd:bg-gray-50 hover:bg-purple-100'}`}>
                  <div className="inline-block whitespace-nowrap overflow-hidden pt-1.5 pl-4 pr-3 text-xs md:text-sm text-gray-900 sm:pl-6 w-4/12">{ activity.name() }</div>
                  <div className="inline-block whitespace-nowrap overflow-hidden px-2 pt-1.5 text-xs md:text-sm text-gray-900 w-3/12 md:w-2/12">{ activity.startDateShort() }</div>
                  <div className="inline-block whitespace-nowrap overflow-hidden px-2 pt-1.5 text-xs md:text-sm text-gray-900 text-left w-2/12">{ activity.type() }</div>
                  <div className="inline-block whitespace-nowrap overflow-hidden px-2 pt-1.5 text-xs md:text-sm text-left text-gray-900 w-2/12">{ activity.distance() }</div>
                  <div className="hidden md:inline-block whitespace-nowrap overflow-hidden px-2 pr-4 pt-1.5 text-xs md:text-sm text-left text-gray-900 w-2/12">{ activity.movingTime() }</div>
                </div>
              )
            })
          }
        </div>
      </div>
    </div>
  )
}

export default ActivitiesTable;