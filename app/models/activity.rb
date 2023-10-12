class Activity < ApplicationRecord
  belongs_to :user
  has_many :photos
  has_many :activity_groups
  has_many :groups, through: :activity_groups
  has_one :geometry, dependent: :destroy

  # validates :strava_id, presence: true, uniqueness: true

  scope :with_geometry, -> { where.not(summary_polyline: nil).where.not(summary_polyline: '') }
  scope :chronological, -> { order(start_date: :desc) }
end
