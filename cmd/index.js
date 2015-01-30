'use strict';

var request = require('request');
var fs = require('fs');
var _ = require('lodash');



var ws_media = 'http://cms-admin.sfr.fr/tiilta2/webservices/rest/private/v1_0/media/upload';
var db       = "public/media/db.json";



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

        }).auth('tiilta', 'atliit', true);

};


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


updateDB();



