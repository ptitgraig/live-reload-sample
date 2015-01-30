/**
 * Class Prototype ${USER} ${DATE}
 */
/* global $, io */
'use strict';

(function(){


    var server_url = 'http://localhost:9009' ;
    var socket = io.connect(server_url);

    var template = function (s,d){
        for(var p in d)
            s=s.replace(new RegExp('{{'+p+'}}','g'), d[p]);
        return s;
    };


    var tpl = '<div class="col-md-3 image"><div class="wrap"><img src="{{uriContent}}" /></div><p class="muted">{{uriContent}}</p></div>';


    var fill = function (data) {
        var wrap = $(".images") ;
        wrap.empty();

        $.each(data, function(idx, item){
            wrap.append(template(tpl,item));
        });
    };


    var reload= function(){
        $.ajax({
            url:server_url + '/media/db.json',
            success: function(data){
                fill(data);
            }
        });
    };


    reload();


    socket.on('image', function(message) {
        console.log(message.msg);
        reload();
    });




})();
