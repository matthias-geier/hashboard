
class Token
  include Cargobull::Service

  def create
    id = @params["id"]
    return {} unless id =~ Board.id_match_pattern

    return Board.create_token(id)
  end

  def read
    token = @params["token"]
    return {} unless token =~ Board.id_match_pattern

    return Board.consume_token(token)
  end
end
