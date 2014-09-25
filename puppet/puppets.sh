#!/bin/bash
set -e -x
EC2_HOSTNAME=ec2-54-244-92-27.us-west-2.compute.amazonaws.com
export DEBIAN_FRONTEND=noninteractive
aptitude -y install puppet
echo "
[agent]
server=$EC2_HOSTNAME
" >> /etc/puppet/puppet.conf
sed -i /etc/default/puppet -e 's/START=no/START=yes/'
service puppet restart
