/**
 * Class Prototype ${USER} ${DATE}
 */
/* global $, io */
'use strict';

(function(){





    // ----
    // LIBS
    // ----

    var template = function (s,d){
        for(var p in d)
            s=s.replace(new RegExp('{{'+p+'}}','g'), d[p]);
        return s;
    };



    var UpdateHTML = function () {
        this.init.apply(this, arguments);
    };

    UpdateHTML.prototype = {
        constructor: UpdateHTML.prototype.constructor,
        options: {
            selector:"",
            sourceURL:"",
            method:'replace' // replace, wrap, prepend
        },
        originalHTML:'',
        setHTML: function(html){
            if (this.options.method=='replace')
                this.$element.html(html);
            else if (this.options.method=='prepend')
                this.$element.prepend(html);
            else if (this.options.method=='append')
                this.$element.append(html);
            else
            {
                var enhanced = template(html,{originalContent:this.originalHTML});
                this.$element.html(enhanced);
            }
        },
        update: function(){
            var that = this;
            if (new RegExp("^http").test(this.options.sourceURL)) {
                $.ajax({
                    url:this.options.sourceURL,
                    success:function(data){
                        that.setHTML(data);
                    }
                });
            }else {
                that.setHTML(this.options.sourceURL);
            }

        },
        init: function (options) {
            this.options = $.extend(true, {}, this.options, options);
            this.$element = $(this.options.selector);
            this.originalHTML = this.$element.html();
        }
    };

    var FragmentManager = function () {
        this.init.apply(this, arguments);
    };

    FragmentManager.prototype = {
        constructor: FragmentManager.prototype.constructor,
        options: {

        },
        fragments:{},
        all: function(){
            $.each(this.fragments, function(idx, item){
                item.obj.update();
            });
        },
        register:function(selector, sourceURL, method){
            var html = new UpdateHTML({selector:selector, sourceURL:sourceURL, method:method});
            this.fragments[selector] = {
                sourceURL:sourceURL,
                selector:selector,
                obj: html
            };
        },
        init: function (options) {
            this.options = $.extend(true, {}, this.options, options);
            this.$element = $(this.options.selector);
        }
    };



    // -----
    // INITS
    // -----

    var server_url = 'http://localhost:9009/' ;

    var socket = io.connect(server_url);

    var fragmentManager = new FragmentManager();
    fragmentManager.register('#sfrCurrentUser', server_url+"html/connected-user.html");
    fragmentManager.register('.sfrG13 .col.left', server_url+"html/col-left.html", "wrap");
    //fragmentManager.register('.sfrG13 .col.right', server_url+"html/col-right.html", "prepend");
    fragmentManager.register('.sfrDom .sfrBoard .section .content .account .picture', "");
    fragmentManager.all();



    // CUSTOM
    $(".sfrG13").removeClass('sfrDomGlobalWidth');
    $(".sfrDom .bloc.login").remove();


    socket.on('msg', function(message) {
        console.log(message.msg);
        fragmentManager.all();
    });




})();
