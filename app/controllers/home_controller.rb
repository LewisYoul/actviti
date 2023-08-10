class HomeController < ApplicationController
  def index
    redirect_to authenticated_root_path if current_user

    @strava_login_url = "https://www.strava.com/oauth/authorize?client_id=57045&scope=read,read_all,profile:read_all,profile:write,activity:read,activity:read_all,activity:write&redirect_uri=#{base_env_url}/oauth&response_type=code&approval_prompt=auto&state=private"
  end
end
