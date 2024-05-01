class ActivityGroupsController < ApplicationController
  before_action :authenticate_user

  def index
    @activity = current_user.activities.find(params[:activity_id])

    render json: @activity.activity_groups
  end

  def create
    @group = current_user.groups.find(params[:group_id])
    @activity = current_user.activities.find(params[:activity_id])
    @activity_group = @group.activity_groups.create!(activity: @activity, group: @group)

    render json: @activity_group
  end

  def destroy
    @activity_group = current_user.activity_groups.find(params[:id])
    @activity = @activity_group.activity
    @group = @activity_group.group
    @activity_group.destroy!

    render json: {}, status: :ok
  end
end