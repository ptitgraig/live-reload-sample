'use strict';
/* globals require */

module.exports = function  (grunt) {


    require('load-grunt-tasks')(grunt);

    var request = require('http');
    var fs = require('fs');
    var _ = require('lodash');
    var io = require('socket.io');




    var Register = function(){}
    Register.prototype = {
        file: function(local_file){

            var ws_media = 'http://cms-admin.sfr.fr/tiilta2/webservices/rest/private/v1_0/media/upload';
            var db       = "public/media/db.json";

            var updateDB = function(file){

                if (!file) return ;

                var data = [];


                var addFile = function(file){
                    data.push(file);
                };

                var fetch = function(file){
                    return _.where(data, {id:file.id}) ;
                };

                var write = function(){
                    var space = 0;
                    var raw = JSON.stringify(data, null, space) ;
                    fs.writeFileSync(db, raw, {encoding: 'utf-8'});


                    var io = grunt.option("io") ;
                    io.sockets.emit('image',{'msg':'image is added'});
                };

                var read = function(){
                    fs.readFile(db,{encoding:'utf8'}, function(err, pdata){

                        data = JSON.parse(pdata) ;
                        if (fetch(file).length < 1) {
                            // INJECT
                            addFile(file);
                            write();
                        }

                    });
                };

                read();


            };



            var uploadFile = function(file){


                var file_path = (/^.*\/(.*)\.(.*)$/g).exec(file);
                var file_name = file_path[1];
                var file_ext  = file_path[2];


                var formData = {
                    file: fs.createReadStream(file),
                    filename: file_name + "." + file_ext
                };


                request.post({url:ws_media, formData: formData},
                    function optionalCallback(err, httpResponse, body) {
                        if (err) {
                            return console.error('upload failed:', err);
                        }
                        console.log('Upload successful!  Server responded with:', body);
                        updateDB(JSON.parse(body));

                    }).auth('tiilta', 'atliit', true);

            };

            uploadFile(local_file);
        }
    };


    var register = new Register();



    grunt.initConfig({

        connect: {


            server: {
                options: {
                    livereload:true,
                    hostname:'localhost',
                    port: 9009,
                    base: 'public',
                    directory:'public',
                    middleware: function(connect, options, middlewares) {
                        middlewares.unshift(function(req, res, next) {
                            res.setHeader('Access-Control-Allow-Origin', '*');
                            res.setHeader('Access-Control-Allow-Methods', '*');
                            next();
                        });

                        return middlewares;
                    },
                    onCreateServer: function(server, connect, options) {


                        var io = require('socket.io').listen(server);
                        grunt.option("io",io);


                        io.sockets.on('connection', function(socket) {
                            console.log("User Connected !");
                            grunt.task.run('html');
                        });



                    }
                }
            }
        },

        html:{

        },

        less: {
            dev: {
                files: {
                    "public/css/home.sfr.css": "public/css/less/home.sfr.less"
                }
            }
        },

        watch: {

            options: {
                livereload:true
                //spawn: false
            },
            less: {
                files: ["public/css/less/**/*.less"],
                tasks: ['less:dev'],
                options: { spawn: true, livereload: false }
            },
            html: {
                files: ["public/html/**/*.html"],
                tasks: ['html'],
                options: { spawn: false, livereload: false }
            },
            js: {
                files: ['public/js/**/*.js'],
                options: { livereload: true }
            },
            liveCss:{
                files: ['public/css/**/*.css']
            },
            images: {
                files: ["images/**/*.png","images/**/*.jpg","images/**/*.gif"]
            }


        }
    });


    grunt.event.on('watch', function(action, filepath) {
        if (action == 'added' && new RegExp("^images/").test(filepath)) {
            console.log("image added : ", filepath);
            register.file(filepath);
        }
    });

    grunt.registerTask('html', 'Updating HTML...', function() {

        console.log('in html')
        // TODO SEND SOURCE FILE TO USERS
        var io = grunt.option("io") ;
        io.sockets.emit('msg',{'msg':'html is updated'});
    });





    grunt.registerTask('default', ['connect:server','watch']);

}