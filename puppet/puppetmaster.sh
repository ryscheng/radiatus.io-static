#!/bin/bash
set -e -x
EC2_HOSTNAME=ec2-54-244-92-27.us-west-2.compute.amazonaws.com
export DEBIAN_FRONTEND=noninteractive
hostname $EC2_HOSTNAME
echo $EC2_HOSTNAME > /etc/hostname
aptitude -y install puppetmaster
echo "*" > /etc/puppet/autosign.conf
service puppetmaster restart
