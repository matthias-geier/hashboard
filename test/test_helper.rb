gem 'minitest'
require 'minitest/autorun'
require 'cargobull/test_helper'

Database.close
Database.create(1)
Database.db.flushdb
Cargobull.env.transform_out = nil
