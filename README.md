# Required gems

* redis
* cargobull
* thin (or equivalent)
* json

# Required software

* redis on localhost
* ruby 2.1 ideally

# Running it

cd into the git root

```bash
  thin start
```

Navigate to localhost:3000 in your browser (if you are using thin)

# Running with Vagrant

cd into git root

```bash
  vagrant up
  vagrant ssh
  cd /vagrant
  thin start
```

