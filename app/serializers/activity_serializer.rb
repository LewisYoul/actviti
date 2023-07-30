class ActivitySerializer < ActiveModel::Serializer
  has_many :photos
    # TODO: only return ones we need
  attributes(*Activity.column_names)
end