  def base_env_url
    return "http://localhost:3000" if Rails.env.development?

    "https://maptiviti.com"
  end