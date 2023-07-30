# lib/tasks/my_task.rake

desc "An example Rake task that uses the Rails environment"
task :import_activity_photos => :environment do
  Activity.all.each do |activity|
		if !activity.polyline
			strava_client = StravaClient.new(activity.user)
			strava_activity = strava_client.activity(activity.strava_id)
			photos = strava_client.activity_photos(activity.strava_id)
	
			Activity.transaction do
				photos.each do |strava_photo|
					activity.photos.find_or_create_by!(unique_id: strava_photo.unique_id) do |photo|
						photo.default_photo = strava_photo.default_photo
						photo.url = strava_photo.urls['2048']
						photo.thumbnail_url = strava_photo.urls['96']
						photo.latlng = strava_photo.location
					end
				end
	
				activity.update!(polyline: strava_activity.map.polyline)
			end
		end
	end
end
