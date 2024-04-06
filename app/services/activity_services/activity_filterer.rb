module ActivityServices
  class ActivityFilterer
    DEFAULT_LIMIT = 100

    def initialize(activities, params)
      @activities = activities
      @params = params
    end

    def call
      @activities = @activities.where("name ILIKE ?", "%#{name}%") if name
      @activities = @activities.where(activity_type: activity_types) if activity_types.any?
      @activities = @activities.joins(:activity_groups).where(activity_groups: { group_id: group_ids }).distinct if group_ids.any?
      @activities = @activities.where("DATE_TRUNC('day', start_date) >= ?", start_date) if start_date
      @activities = @activities.where("DATE_TRUNC('day', start_date) <= ?", end_date) if end_date
      @activities = @activities.where("distance > ?", min_distance) if min_distance
      @activities = @activities.where("distance < ?", max_distance) if max_distance if max_distance && max_distance < 80000
      @activities = @activities.where("moving_time > ?", min_duration) if min_duration
      @activities = @activities.where("moving_time < ?", max_duration) if max_duration && max_duration < 21600
      

      # Activity.with_geometry.each { |a| puts a.id; Geometry.create!(activity: a,  geometry: "LINESTRING(#{Polylines::Decoder.decode_polyline(a.summary_polyline).map { |lat, long| "#{lat} #{long}" }.join(', ')})") }
      if bbox
        geometry_table = Geometry.arel_table

        ne = RGeo::Cartesian.factory(srid: 4326).point(bbox.northeast_lat, bbox.northeast_lng)
        sw = RGeo::Cartesian.factory(srid: 4326).point(bbox.southwest_lat, bbox.southwest_lng)
        rgeo_bbox = RGeo::Cartesian::BoundingBox.create_from_points(sw, ne)
        @activities = @activities.joins(:geometry).where(geometry_table[:geometry].st_intersects(rgeo_bbox))
      end

      Result.new(@activities.limit(DEFAULT_LIMIT).includes(:photos))
    end

    private

    def bbox
      @bbox ||= @params[:bbox] ? Bbox.new(@params[:bbox]) : nil
    end

    def start_date
      @start_date ||= @params[:start_date].presence
    end

    def end_date
      @end_date ||= @params[:end_date].presence
    end

    def name
      @name ||= @params[:name] && !@params[:name].empty? ? @params[:name] : nil
    end

    def activity_types
      @activity_types ||= Array.wrap(@params[:activity_types]).compact.reject(&:blank?)
    end

    def group_ids
      @group_ids ||= Array.wrap(@params[:group_ids])
    end

    def min_distance
      # convert km to m
      @min_distance ||= @params[:min_distance].present? ? @params[:min_distance].to_i * 1000 : nil
    end

    def max_distance
      # convert km to m
      @max_distance ||= @params[:max_distance].present? ? @params[:max_distance].to_i * 1000 : nil
    end

    def min_duration
      # convert hrs to seconds
      @min_duration ||= @params[:min_duration].present? ? @params[:min_duration].to_f * 60 * 60 : nil
    end

    def max_duration
      # convert hrs to seconds
      @max_duration ||= @params[:max_duration].present? ? @params[:max_duration].to_f * 60 * 60 : nil
    end

    class Result
      attr_reader :activities

      def initialize(activities)
        @activities = activities
      end
    end
  end
end