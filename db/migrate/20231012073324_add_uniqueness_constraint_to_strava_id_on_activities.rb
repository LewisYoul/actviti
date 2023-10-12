class AddUniquenessConstraintToStravaIdOnActivities < ActiveRecord::Migration[7.0]
  def change
    add_index :activities, :strava_id, unique: true
  end
end
