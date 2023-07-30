class Add < ActiveRecord::Migration[7.0]
  def change
    add_column :photos, :latlng, :jsonb
    add_column :photos, :thumbnail_url, :string
  end
end
