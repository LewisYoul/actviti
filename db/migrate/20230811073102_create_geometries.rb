class CreateGeometries < ActiveRecord::Migration[7.0]
  def change
    create_table :geometries do |t|
      t.references :activity, null: false, foreign_key: true, index: true
      t.geometry :geometry, null: false, srid: 4326

      t.timestamps
    end

    add_index :geometries, :geometry, using: :gist
  end
end
