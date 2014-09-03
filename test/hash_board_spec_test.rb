require 'test_helper'

describe HashBoard do
  describe "board functions" do
    after do
      Database.db.flushdb
    end

    it "should return a id when creating a board" do
      put :hash_board
      assert_match(/^[a-zA-Z0-9]{10}$/, response["id"])
    end

    it "should read a board with data when requesting a id" do
      put :hash_board, "user" => "moo"
      get :hash_board, "id" => response["id"]
      assert_equal ["created_by", "created_on", "entries"], response.keys
    end

    it "should update a board with a post" do
      put :hash_board
      id = response["id"]
      patch :hash_board, "id" => id, "created_by" => "moo",
        "content" => "I can has cheezburger"
      get :hash_board, "id" => id
      entry = response["entries"].first
      assert_equal "moo", entry["created_by"]
      assert_equal "I can has cheezburger", entry["content"]
      assert entry["created_on"]
    end

    it "should read empty hash when id is bogus" do
      get :hash_board, "id" => "gnu"
      assert_equal({}, response)
    end

    it "should return empty hash when update id is bogus" do
      patch :hash_board, "id" => "gnu"
      assert_equal({}, response)
    end

    describe "pagination" do
      before do
        put :hash_board
        @id = response["id"]
        @entries = 15.times.map do |i|
          patch :hash_board, "id" => @id, "created_by" => "user#{i}",
            "content" => "content#{i}"
          next response
        end.reverse
      end

      after do
        Database.db.flushdb
      end

      it "should get the first 10 elements through pagination" do
        get :hash_board, "id" => @id
        assert_equal 10, response["entries"].length
        10.times.each do |i|
          assert_equal @entries[i]["content"],
            response["entries"][i]["content"]
        end
      end

      it "should get the last 5 elements through pagination" do
        get :hash_board, "id" => @id, "index" => "1"
        assert_equal 5, response["entries"].length
        5.times.each do |i|
          assert_equal @entries[i+10]["content"],
            response["entries"][i]["content"]
        end
      end
    end
  end
end
