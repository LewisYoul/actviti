class AddDeletedInStravaToActivities < ActiveRecord::Migration[7.0]
  def change
    add_column :activities, :deleted_in_strava, :boolean, null: false, default: false
  end
end
