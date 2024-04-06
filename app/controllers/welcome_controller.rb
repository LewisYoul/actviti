class WelcomeController < ApplicationController
  layout 'welcome'

  before_action :authenticate_user

  def index
    # They have already imported their activities, so redirect them to the map
    return redirect_to authenticated_root_path if current_user.activities.any?
  end
end