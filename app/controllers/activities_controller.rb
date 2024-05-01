class ActivitiesController < ApplicationController
  before_action :authenticate_user

  # def select
  #   respond_to do |format|
  #     format.turbo_stream do
  #       @activity = current_user.plan_limited_activities.find_by(id: params[:id])

  #       if !@activity.polyline
  #         strava_activity = strava_client.activity(@activity.strava_id)
  #         photos = strava_client.activity_photos(@activity.strava_id)

  #         Activity.transaction do
  #           photos.each do |strava_photo|
  #             @activity.photos.find_or_create_by!(unique_id: strava_photo.unique_id) do |photo|
  #               photo.default_photo = strava_photo.default_photo
  #               photo.url = strava_photo.urls['2048']
  #             end
  #           end

  #           @activity.update!(polyline: strava_activity.map.polyline)
  #         end
  #       end
  #     end
  #   end
  # end

  def deselect
    respond_to do |format|
      format.turbo_stream
    end
  end
  
  def index
    respond_to do |format|
      @previous_page = params[:page].to_i - 1
      @page = params[:page].to_i
      @next_page = params[:page].to_i + 1
      @filter_result = ActivityServices::ActivityFilterer.new(current_user.plan_limited_activities, params).call

      format.turbo_stream
      format.html
      format.json do
        render json: @filter_result.activities, each_serializer: ActivityListItemSerializer
      end
    end
  end

  def show
    @activity = current_user.plan_limited_activities.find_by(id: params[:id])

    if !@activity.deleted_in_strava && !@activity.polyline
      strava_activity = strava_client.activity(@activity.strava_id)
      photos = strava_client.activity_photos(@activity.strava_id)

      Activity.transaction do
        photos.each do |strava_photo|
          @activity.photos.find_or_create_by!(unique_id: strava_photo.unique_id) do |photo|
            photo.default_photo = strava_photo.default_photo
            photo.url = strava_photo.urls['2048']
            photo.thumbnail_url = strava_photo.urls['96']
            photo.latlng = strava_photo.location
          end
        end

        @activity.update!(polyline: strava_activity.map.polyline)
      end
    end

    respond_to do |format|
      format.json do
        render json: @activity, serializer: ActivitySerializer
      end
      format.html
    end
  end

  def import
    respond_to do |format|
      format.json do
        if !current_user.activities.exists?
          activities = []

          # There is a bug in this gem that means doing
          # activities = client.athlete_activities(per_page: 100) would only
          # return a maximum of 100 activities
          strava_client.athlete_activities(per_page: 100) { |activity| activities << activity }

          Activity.transaction do
            activities.each do |activity|
              activity = Activity.create!(
                user: current_user,
                name: activity.name,
                activity_type: activity.sport_type,
                distance: activity.distance,
                moving_time: activity.moving_time,
                elapsed_time: activity.elapsed_time,
                total_elevation_gain: activity.total_elevation_gain,
                strava_id: activity.id,
                start_date: activity.start_date,
                start_date_local: activity.start_date_local,
                timezone: activity.timezone,
                utc_offset: activity.utc_offset,
                location_country: activity.location_country,
                achievement_count: activity.achievement_count,
                kudos_count: activity.kudos_count,
                comment_count: activity.comment_count,
                athlete_count: activity.athlete_count,
                photo_count: activity.photo_count,
                summary_polyline: activity.map.summary_polyline,
                visibility: activity.visibility,
                start_latlng: activity.start_latlng,
                end_latlng: activity.end_latlng,
                average_speed: activity.average_speed,
                max_speed: activity.max_speed,
                average_cadence: activity.average_cadence,
                has_heartrate: activity.has_heartrate,
                average_heartrate: activity.average_heartrate,
                max_heartrate: activity.max_heartrate,
                elev_high: activity.elev_high,
                elev_low: activity.elev_low,
                external_id: activity.external_id,
                total_photo_count: activity.total_photo_count
              )

              next if !activity.summary_polyline || activity.summary_polyline == ''

              Geometry.create!(activity: activity,  geometry: "LINESTRING(#{Polylines::Decoder.decode_polyline(activity.summary_polyline).map { |lat, long| "#{lat} #{long}" }.join(', ')})")
            end
          end
        end

        render json: { message: 'Activities imported' }
      end
    end
  end

  def refresh
    last_activity = current_user.plan_limited_activities.chronological.first

    # There is a bug in this gem that means the block isn't called when 
    # passing the after: argument (at least so it seems)
    new_activities = strava_client.athlete_activities(after: last_activity.start_date, per_page: 100)
    
    new_activities.each do |strava_activity|
      Activity.transaction do
        new_activity = current_user.activities.find_or_create_by!(strava_id: strava_activity.id) do |activity|
          activity.name = strava_activity.name
          activity.activity_type = strava_activity.sport_type
          activity.distance = strava_activity.distance
          activity.moving_time = strava_activity.moving_time
          activity.elapsed_time = strava_activity.elapsed_time
          activity.total_elevation_gain = strava_activity.total_elevation_gain
          activity.strava_id = strava_activity.id
          activity.start_date = strava_activity.start_date
          activity.start_date_local = strava_activity.start_date_local
          activity.timezone = strava_activity.timezone
          activity.utc_offset = strava_activity.utc_offset
          activity.location_country = strava_activity.location_country
          activity.achievement_count = strava_activity.achievement_count
          activity.kudos_count = strava_activity.kudos_count
          activity.comment_count = strava_activity.comment_count
          activity.athlete_count = strava_activity.athlete_count
          activity.photo_count = strava_activity.photo_count
          activity.summary_polyline = strava_activity.map.summary_polyline
          activity.visibility = strava_activity.visibility
          activity.start_latlng = strava_activity.start_latlng
          activity.end_latlng = strava_activity.end_latlng
          activity.average_speed = strava_activity.average_speed
          activity.max_speed = strava_activity.max_speed
          activity.average_cadence = strava_activity.average_cadence
          activity.has_heartrate = strava_activity.has_heartrate
          activity.average_heartrate = strava_activity.average_heartrate
          activity.max_heartrate = strava_activity.max_heartrate
          activity.elev_high = strava_activity.elev_high
          activity.elev_low = strava_activity.elev_low
          activity.external_id = strava_activity.external_id
          activity.total_photo_count = strava_activity.total_photo_count
        end

        next if !new_activity.summary_polyline || new_activity.summary_polyline == ''

        Geometry.create!(activity: new_activity,  geometry: "LINESTRING(#{Polylines::Decoder.decode_polyline(new_activity.summary_polyline).map { |lat, long| "#{lat} #{long}" }.join(', ')})")
      end
    end

    head :ok
  end

  private

  def strava_client
    StravaClient.new(current_user)
  end
end