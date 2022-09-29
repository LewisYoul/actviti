# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# This file is the source Rails uses to define your schema when running `bin/rails
# db:schema:load`. When creating a new database, `bin/rails db:schema:load` tends to
# be faster and is potentially less error prone than running all of your
# migrations from scratch. Old migrations may fail to apply correctly if those
# migrations use external dependencies or application code.
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema[7.0].define(version: 2022_09_29_071525) do
  # These are extensions that must be enabled in order to support this database
  enable_extension "pg_stat_statements"
  enable_extension "plpgsql"

  create_table "activities", force: :cascade do |t|
    t.bigint "user_id", null: false
    t.string "name", null: false
    t.string "activity_type", null: false
    t.float "distance"
    t.integer "moving_time"
    t.integer "elapsed_time"
    t.float "total_elevation_gain"
    t.string "strava_id", null: false
    t.datetime "start_date", null: false
    t.datetime "start_date_local", null: false
    t.string "timezone", null: false
    t.float "utc_offset"
    t.string "location_country"
    t.integer "achievement_count"
    t.integer "kudos_count"
    t.integer "comment_count"
    t.integer "athlete_count"
    t.integer "photo_count"
    t.string "summary_polyline"
    t.string "visibility"
    t.jsonb "start_latlng"
    t.jsonb "end_latlng"
    t.float "average_speed"
    t.float "max_speed"
    t.float "average_cadence"
    t.boolean "has_heartrate"
    t.float "average_heartrate"
    t.float "max_heartrate"
    t.float "elev_high"
    t.float "elev_low"
    t.string "external_id"
    t.integer "total_photo_count"
    t.boolean "fetched", default: false, null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["user_id"], name: "index_activities_on_user_id"
  end

  create_table "photos", force: :cascade do |t|
    t.string "unique_id"
    t.boolean "default_photo"
    t.string "url"
    t.bigint "activity_id", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["activity_id"], name: "index_photos_on_activity_id"
  end

  create_table "plans", force: :cascade do |t|
    t.string "level", null: false
    t.string "stripe_price_id"
    t.integer "yearly_cost_dollars", null: false
  end

  create_table "subscriptions", force: :cascade do |t|
    t.bigint "plan_id", null: false
    t.bigint "user_id", null: false
    t.datetime "start_datetime"
    t.datetime "end_datetime"
    t.boolean "cancel_at_period_end", default: false, null: false
    t.string "stripe_subscription_id"
    t.string "status", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["plan_id"], name: "index_subscriptions_on_plan_id"
    t.index ["user_id"], name: "index_subscriptions_on_user_id"
  end

  create_table "tokens", force: :cascade do |t|
    t.bigint "user_id", null: false
    t.string "refresh_token", null: false
    t.string "access_token", null: false
    t.datetime "expires_at", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["user_id"], name: "index_tokens_on_user_id"
  end

  create_table "users", force: :cascade do |t|
    t.string "first_name", null: false
    t.string "last_name", null: false
    t.string "strava_id", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.string "stripe_customer_id"
    t.string "remember_token"
    t.index ["strava_id"], name: "index_users_on_strava_id", unique: true
  end

  add_foreign_key "activities", "users"
  add_foreign_key "photos", "activities"
  add_foreign_key "subscriptions", "plans"
  add_foreign_key "subscriptions", "users"
  add_foreign_key "tokens", "users"
end
