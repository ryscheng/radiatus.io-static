# Puppet Manifest

# include nodejs

class { 'nodejs':
  manage_repo => true,
}

package { 'grunt-cli':
  ensure => present,
  provider => 'npm',
}
