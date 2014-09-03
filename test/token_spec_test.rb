require 'test_helper'

describe Token do
  before do
    put :hash_board
    @id = response["id"]
  end

  after do
    Database.db.flushdb
  end

  it "should create a token to an existing board" do
    put :token, "id" => @id
    assert_match(/^[a-zA-Z0-9]{10}$/, response["token"])
  end

  it "should consume a token and return the id to board" do
    put :token, "id" => @id
    token = response["token"]
    assert_match(/^[a-zA-Z0-9]{10}$/, token)
    post :token, "token" => token
    assert_equal @id, response["id"]
  end
end
