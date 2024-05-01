class ActivitySerializer < ActiveModel::Serializer
  has_many :photos
  has_many :activity_groups

  # TODO: only return ones we need
  attributes(*Activity.column_names)
end