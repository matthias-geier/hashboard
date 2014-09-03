VAGRANTFILE_API_VERSION = "2"

$script = <<SCRIPT
echo Provisioning...
sudo apt-get update
sudo apt-get -y install software-properties-common
sudo apt-get -y install python-software-properties
sudo apt-get -y install build-essential
sudo add-apt-repository ppa:brightbox/ruby-ng
sudo apt-get update
sudo apt-get -y install ruby2.1 ruby2.1-dev
sudo gem install redis cargobull thin json
SCRIPT

Vagrant.configure(VAGRANTFILE_API_VERSION) do |config|
  config.vm.box = "hashicorp/precise64"
  config.vm.hostname = "hashboard-dev"
  config.vm.network :forwarded_port, guest: 3000, host: 3000
  config.vm.provision "shell", inline: $script
end
