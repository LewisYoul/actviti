class GroupsController < ApplicationController
  before_action :authenticate_user
  
  def index
    render json: @current_user.groups
  end

  def groupings
    @groups = current_user.groups.includes(:activity_groups)
  end

  def create
    respond_to do |format|
      format.turbo_stream do
        @group = current_user.groups.create!(group_params)
        @activity = current_user.activities.find(params[:activity_id])
        @activity_group = @group.activity_groups.create!(activity: @activity)
        @groups = current_user.groups.includes(:activity_groups)
      end
    end
  end

  def destroy
    respond_to do |format|
      format.turbo_stream do
        @group = current_user.groups.find(params[:id])
        @group.destroy!
        @groups_count = current_user.groups.count
      end
    end
  end

  private

  def group_params
    params.require(:group).permit(:name, :description)
  end
end