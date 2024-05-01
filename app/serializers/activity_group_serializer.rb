class ActivityGroupSerializer < ActiveModel::Serializer
  attributes(:id, :activity_id, :group_id, :group)

  def group
    GroupSerializer.new(object.group)
  end
end