class Geometry < ApplicationRecord
  belongs_to :activity

  validates :geometry, presence: true
end