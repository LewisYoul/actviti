import React from 'react'

const Modal = () => {
  const [isVisible, setIsVisible] = React.useState(false)
  const [activity, setActivity] = React.useState()
  const [groups, setGroups] = React.useState()
  const [activityGroups, setActivityGroups] = React.useState()

  React.useEffect(() => {
    window.addEventListener('openModal', (event) => {
      console.log('gfd', event.detail.activity)
      setIsVisible(true)
      setActivity(event.detail.activity)
    })
  }, [])

  React.useEffect(() => {
    if (!activity) { return }

    fetchGroups()
    fetchActivityGroups()
  }, [activity])

  const fetchGroups = async () => {
    const res = await fetch(`groups.json`)
    const groups = await res.json()

    console.log('groups', groups)

    setGroups(groups)
  }

  const fetchActivityGroups = async () => {
    const res = await fetch(`activities/${activity.id}/activity_groups.json`)
    const activityGroups = await res.json()

    console.log('activityGroups', activityGroups)

    setActivityGroups(activityGroups)
  }

  const addToGroup = (group) => {
    const csrfToken = document.querySelector("[name='csrf-token']").content

    fetch(`activity_groups.json`, {
      method: "POST",
      headers: {
        "X-CSRF-Token": csrfToken,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        group_id: group.id,
        activity_id: activity.id
      })
    })
    .then(res => {
      res.json().then(data => {
        console.log('data', data)

        fetchActivityGroups()
      })
    })
  }

  const removeFromGroup = (activityGroup) => {
    const csrfToken = document.querySelector("[name='csrf-token']").content

    fetch(`activity_groups/${activityGroup.id}.json`, {
      method: "DELETE",
      headers: {
        "X-CSRF-Token": csrfToken,
        "Content-Type": "application/json"
      }
    })
    .then(res => {
      res.json().then(data => {
        console.log('data', data)

        fetchActivityGroups()
      })
    })
  }

  const removeFromGroupButton = (group, activityGroup) => {
    return (
      <button onClick={() => {removeFromGroup(activityGroup)}} className="border border-md rounded-md py-4 px-3 w-full bg-purple-500 text-white">
        <div className="flex justify-between">
          <span>{group.name}</span>
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
          </svg>
        </div>
      </button>
    )
  }

  const addToGroupButton = (group) => {
    return (
      <button onClick={() => {addToGroup(group)}} className="border border-md rounded-md py-4 px-3 w-full hover:bg-gray-100">
        <div className="flex justify-between">
          <span>{group.name}</span>
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
        </div>
      </button>
    )
  }

  return (
    <div className={`${isVisible ? '' : 'hidden'} z-1100 fixed h-full w-full inset-0 z-50 bg-gray-500 bg-opacity-70`}>
      <div className="flex justify-center">
        <div className="relative bg-white rounded-md bg-opacity-100 w-[720px] h-[525px] mt-6">
          <div className="px-[100px] py-[50px] h-full w-full">
            <div className="flex flex-col h-full justify-between h-full w-full">
              <div>
                <h5 className='text-sm font-semibold mb-1'>Add this activity to a group</h5>
                <hr></hr>
                <input type="text" placeholder="Filter groups" className="text-field mt-2 mb-2" />
              </div>

              <div class="h-[300px] overflow-scroll">
                {activityGroups && groups && (
                  groups.map(group => {
                    const existingActivityGroup = activityGroups.find(activityGroup => {
                      return activityGroup.group_id === group.id
                    })

                    return (
                      existingActivityGroup ? removeFromGroupButton(group, existingActivityGroup) : addToGroupButton(group)
                    )
                  })
                )}
              </div>

              <div class="flex justify-between">
                <button className="button-primary">Done</button>
                <button className="bg-white hover:bg-gray-100 px-4 py-1.5 border rounded-md">Create Group</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Modal;