class Board
  @range = 10

  def self.board_by_id(id)
    data = Database.db.hgetall("b:#{id}")
    data["created_on"] = Time.at(data["created_on"].to_i) unless data.empty?
    return data
  end

  def self.entries_by_id(id, page=0, range=@range)
    count = Database.db.zcard("be:#{id}")
    return [] if count == 0

    start = page * range
    stop = start + @range - 1
    return Database.db.zrevrange("be:#{id}", start, stop).map do |ref|
      data = Database.db.hgetall(ref)
      data["created_on"] = Time.at(data["timestamp"].to_f)
      next data
    end
  end

  def self.generate_id(len=20)
    @opts ||= ('A'..'Z').to_a + ('0'..'9').to_a + ('a'..'z').to_a
    return len.times.map{ @opts[rand(@opts.length)] }.join
  end

  def self.id_match_pattern
    return /^[a-zA-Z0-9]+$/
  end

  def self.create(whom, is_shared)
    while(id = self.generate_id)
      break if self.board_by_id(id).empty?
    end

    data = { "created_by" => (whom || "anonymous"),
      "created_on" => Time.now.to_i }
    data["shared"] = is_shared if is_shared
    data.each do |k, v|
      Database.db.hset("b:#{id}", k, v)
    end
    return self.read(id)
  end

  def self.read(id, page=0)
    board = self.board_by_id(id)
    return board.empty? ? {} :
      board.merge({ "entries" => self.entries_by_id(id, page), "id" => id })
  end

  def self.update(id, data)
    return {} if (board = self.board_by_id(id)).empty? || data["content"].empty?

    data["timestamp"] = Time.now.to_f.to_s
    data["created_by"] ||= "anonymous"
    entry_key = "e:#{id}:#{data["timestamp"]}"
    Database.db.hmset("e:#{id}:#{data["timestamp"]}", *data.to_a.flatten)
    Database.db.zadd("be:#{id}", data["timestamp"].to_f, entry_key)

    timeline = board["shared"] ? "trending" : "hidden"
    Database.db.zrem(timeline, "b:#{id}")
    Database.db.zadd(timeline, data["timestamp"].to_f, "b:#{id}")

    return data.merge({ "created_on" => Time.at(data["timestamp"].to_f) })
  end

  def self.trending(num)
    return Database.db.zrevrange("trending", 0, num - 1).map do |ref|
      data = Database.db.hgetall(ref)
      data["created_on"] = Time.at(data["created_on"].to_f)
      data["id"] = ref.sub(/^b:/, '')
      next data
    end
  end

  def self.create_token(id)
    while(token = self.generate_id(24))
      break if Database.db.get("t:#{token}").nil?
    end

    Database.db.set("t:#{token}", id)
    Database.db.expire("t:#{token}", 2 * 24 * 60 * 60)
    return { "token" => token }
  end

  def self.consume_token(token)
    return {} if (id = Database.db.get("t:#{token}")).nil?

    Database.db.del("t:#{token}")
    return { "id" => id }
  end
end
