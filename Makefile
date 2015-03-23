
build:
	bower install
	cp bower_components/jquery/dist/jquery.min.* thirdparty/
	cp bower_components/modernizr/modernizr.js thirdparty/
	cp bower_components/isotope/dist/isotope.pkgd.min.js thirdparty/
	cp bower_components/jquery-backstretch/jquery.backstretch.min.js thirdparty/
	cp -r bower_components/bootstrap/dist thirdparty/bootstrap
	cp -r bower_components/fontawesome thirdparty/fontawesome

run:
	python -m SimpleHTTPServer

all: build run
