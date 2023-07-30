class PhotoSerializer < ActiveModel::Serializer
  # TODO: only return ones we need
  attributes(*Photo.column_names)
end