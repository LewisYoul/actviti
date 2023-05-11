class MapController < ApplicationController
  before_action :authenticate_user

  def index
    @page = 1
    @per_page = 30
    @next_page = 2
    @filter_result = ActivityServices::ActivityFilterer.new(current_user.plan_limited_activities, params).call
    @activities = @filter_result.activities
    @total_count = @filter_result.total_count
    @from = @filter_result.from
    @to = @filter_result.to
    @activity_types = ['AlpineSki', 'BackcountrySki', 'Canoeing', 'Crossfit', 'EBikeRide', 'Elliptical', 'EMountainBikeRide', 'Golf', 'GravelRide', 'Handcycle', 'Hike', 'IceSkate', 'InlineSkate', 'Kayaking', 'Kitesurf', 'MountainBikeRide', 'NordicSki', 'Ride', 'RockClimbing', 'RollerSki', 'Rowing', 'Run', 'Sail', 'Skateboard', 'Snowboard', 'Snowshoe', 'Soccer', 'StairStepper', 'StandUpPaddling', 'Surfing', 'Swim', 'TrailRun', 'Velomobile', 'VirtualRide', 'VirtualRun', 'Walk', 'WeightTraining', 'Wheelchair', 'Windsurf', 'Workout', 'Yoga'].sort.map { |activity_type| { label: activity_type, value: activity_type } }
    @groups_for_filter = @current_user.groups.map { |group| { label: group.name, value: group.id } }
  end
end
