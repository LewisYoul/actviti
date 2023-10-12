module ActivityServices
  class ActivityCreator
    def self.call(strava_user_id, strava_activity_id)
      new(strava_user_id, strava_activity_id).call
    end

    def initialize(strava_user_id, strava_activity_id)
      @strava_user_id = strava_user_id
      @strava_activity_id = strava_activity_id
    end

    def call
      user = User.find_by!(strava_id: @strava_user_id)

      strava = StravaClient.new(user)

      strava_activity = strava.activity(@strava_activity_id)

      Activity.transaction do
        activity = user.activities.create!(
          strava_id: strava_activity.id,
          name: strava_activity.name,
          activity_type: strava_activity.sport_type,
          distance: strava_activity.distance,
          moving_time: strava_activity.moving_time,
          elapsed_time: strava_activity.elapsed_time,
          total_elevation_gain: strava_activity.total_elevation_gain,
          strava_id: strava_activity.id,
          start_date: strava_activity.start_date,
          start_date_local: strava_activity.start_date_local,
          timezone: strava_activity.timezone,
          utc_offset: strava_activity.utc_offset,
          location_country: strava_activity.location_country,
          achievement_count: strava_activity.achievement_count,
          kudos_count: strava_activity.kudos_count,
          comment_count: strava_activity.comment_count,
          athlete_count: strava_activity.athlete_count,
          photo_count: strava_activity.photo_count,
          summary_polyline: strava_activity.map.summary_polyline,
          visibility: strava_activity.visibility,
          start_latlng: strava_activity.start_latlng,
          end_latlng: strava_activity.end_latlng,
          average_speed: strava_activity.average_speed,
          max_speed: strava_activity.max_speed,
          average_cadence: strava_activity.average_cadence,
          has_heartrate: strava_activity.has_heartrate,
          average_heartrate: strava_activity.average_heartrate,
          max_heartrate: strava_activity.max_heartrate,
          elev_high: strava_activity.elev_high,
          elev_low: strava_activity.elev_low,
          external_id: strava_activity.external_id,
          total_photo_count: strava_activity.total_photo_count,
        )

        return if !activity.summary_polyline || activity.summary_polyline == ''
  
        Geometry.create!(activity: activity,  geometry: "LINESTRING(#{Polylines::Decoder.decode_polyline(activity.summary_polyline).map { |lat, long| "#{lat} #{long}" }.join(', ')})")
      end
    end
  end
end