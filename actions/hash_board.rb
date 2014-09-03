class HashBoard
  include Cargobull::Service

  def read
    id = @params["id"]
    page = @params["index"] && @params["index"] =~ /^\d+$/ ?
      @params["index"].to_i : 0
    return {} unless id =~ Board.id_match_pattern

    return Board.read(id, page)
  end

  def update
    id = @params["id"]
    return {} unless id =~ Board.id_match_pattern
    allowed = ["created_by", "content"]

    return Board.update(id, @params.select{ |k, _| allowed.include?(k) })
  end

  def create
    return Board.create(@params["created_by"], @params["is_shared"] == "true")
  end
end
