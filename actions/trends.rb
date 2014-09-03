class Trends
  include Cargobull::Service

  def read
    num = @params["count"] ? @params["count"].to_i : 10
    return Board.trending(num)
  end
end
