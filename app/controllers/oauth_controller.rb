class OauthController < ApplicationController
  def index
    if params[:code]
      client = Strava::OAuth::Client.new(
        client_id: "57045",
        client_secret: "05a3f29d756923b9bec7648f41f5e3ff997ed60c"
      )

      response = client.oauth_token(code: params[:code])
      athlete = response.athlete

      user = User.find_by(strava_id: athlete.id)

      if user
        user.token.update!(
          refresh_token: response.refresh_token,
          access_token: response.access_token,
          expires_at: response.expires_at
        )

        log_in(user)

        redirect_to authenticated_root_path
      else
        user = User.create!(
          strava_id: athlete.id,
          first_name: athlete.firstname,
          last_name: athlete.lastname,
          token_attributes: {
            refresh_token: response.refresh_token,
            access_token: response.access_token,
            expires_at: response.expires_at
          },
          subscription_attributes: {
            plan_id: Plan.find_by(level: 'free').id,
            status: 'active'
          }
        )
        
        log_in(user)

        # first_login is used to determine whether we need to fetch
        # the user's activities from strava the first time they hit the
        # map page
        redirect_to welcome_index_path
      end
    else
      redirect_to unauthenticated_root_path
    end
  end
end
