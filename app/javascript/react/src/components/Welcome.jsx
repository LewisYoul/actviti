import React from "react";

const Welcome = () => {
  React.useEffect(() => {
    fetch('/activities/import')
    .then((res) => {
      if (res.ok) {
        window.location = '/new_map'
      }
    })
    .catch(console.error)
  }, [])

  return (
    <span class="mt-3 block text-gray-700 text-center">Importing your activities from Strava. This may take a moment. Please don't navigate away from the page.</span>
  )
}

export default Welcome;