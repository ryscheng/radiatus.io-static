var c = db.test.find(); var t = 0; while(c.hasNext()) {var x = c.next(); t += ((x.completedReads+x.completedWrites)/x['time'][0])}
pssh -h hosts-trim.txt -l ubuntu -o out -t 0 node index.js ws://10.219.147.212:8082/route mongodb://10.219.147.212:27017/test test 1 1 0 10000

ec2-run-instances --user-data-file puppetmaster.sh -t r3.xlarge -g puppetmaster -k radiatus ami-e7b8c0d7

ec2-run-instances --user-data-file puppets.sh -t r3.large -g puppets -k radiatus ami-e7b8c0d7

ec2-run-instances --user-data-file master.sh -t r3.xlarge -g radiatus -k radiatus ami-1d1f5e2d

ec2-run-instances --user-data-file master.sh -t r3.large -g radiatus -k radiatus ami-1d1f5e2d
