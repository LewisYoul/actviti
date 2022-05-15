class CreateUsers < ActiveRecord::Migration[7.0]
  def change
    create_table :users do |t|
      t.string :first_name, null: false
      t.string :last_name, null: false
      t.string :strava_id, null: false
      t.string :refresh_token, null: false
      t.string :access_token, null: false
      t.datetime :expires_at, null: false

      t.timestamps

      t.index :strava_id, unique: true
    end
  end
end
