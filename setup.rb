require 'redis'
require 'json'

Cargobull.env.dispatch_url = "/api"
Cargobull.env.default_path = "index.html"
Cargobull.env.transform_out = Proc.new do |data|
  next JSON.generate(data)
end
Cargobull::Initialize.dir "lib"
Database.create
Cargobull::Initialize.dir "actions"
Cargobull::Initialize.dir "logic"
