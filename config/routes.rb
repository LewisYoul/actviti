Rails.application.routes.draw do
  get 'session/destroy'
  get 'map/index'
  # Define your application routes per the DSL in https://guides.rubyonrails.org/routing.html

  # Defines the root path 
  get 'map', to: "new_map#index", as: :authenticated_root
  root to: "home#index", as: :unauthenticated_root

  resources :welcome, only: :index
  resources :new_map, only: :index
  resources :home, only: :index
  resources :account, only: :index
  resources :map, only: :index
  resources :oauth, only: :index
  resources :activities, only: %i[index show] do
    get :refresh, on: :collection
    get :import, on: :collection
    put :select, on: :member
    put :deselect, on: :collection
  end
  resources :plans do
    get :success, on: :collection
    get :upgrade, on: :member
  end
  resources :contact, only: :index

  resources :groups, only: %i[create index destroy] do
    get :groupings, on: :collection
  end

  resources :activity_groups

  resources :subscriptions, only: :update
  resources :webhooks do
    # Strava makes a GET to /webhooks/strava to initially enable the subscription
    # Then webhooks are POSTed to /webhooks/strava subsequently
    get :strava, on: :collection
    post :strava, on: :collection
    post :stripe, on: :collection
  end
end
