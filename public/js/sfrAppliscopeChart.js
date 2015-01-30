/**
 * Class Prototype sunny 27/11/14
 */

'use strict';

(function ($, context) {

    var Utils = {
        /**
         * Add the possibility to use data-attribute for options
         *
         * Multiple ways of use :
         *
         * // single option and value
         * become :
         * {
         *     theOption:'value'
         * }
         *
         * // multiple options
         * become :
         * {
         *     name:'value',
         *     foo:'bar',
         *     one:1,
         *     two:2
         * }
         *
         * @method getOptionsFormDom
         * @param {String} pluginName
         * @param {Object} element
         * @returns {*|Object}
         */

        getOptionsFromDom: function(pluginName, element) {
            var pn = pluginName.toLowerCase();
            var pnRe = new RegExp('^' + pn);
            var data = $(element).data() || {};



            // data-pluginname-options attribute -->
            var optionsName = (pn.toLowerCase() + 'Options');
            /*jshint evil:true*/
            var optionsFromDefaultDataAttr;
            try {
                optionsFromDefaultDataAttr = (new Function('return ' + $(element).attr('data-' + pn)))() || {};
            } catch (e) {
                optionsFromDefaultDataAttr = {};
            }
            if (typeof optionsFromDefaultDataAttr !== 'object' || optionsFromDefaultDataAttr instanceof Array) {
                optionsFromDefaultDataAttr = {};
            }
            var options = (new Function('return ' + $(element).attr('data-' + pn + '-options')))() || {};
            options = $.extend(true, {}, optionsFromDefaultDataAttr, options);
            delete data[optionsName];

            // get other options attributes -->
            var replaceFunction = function(a) {
                return a.toLowerCase();
            };
            for (var i in data) {
                if (pnRe.test(i) && data.hasOwnProperty(i)) {
                    /*jshint evil:true*/
                    var value = data[i];
                    if (typeof data[i] === 'string' && /^[\[\{]/.test(data[i])) {
                        try {
                            /*jshint evil:true*/
                            value = (new Function('return ' + data[i]))();
                        } catch (e) {
                            value = data[i];
                        }
                    }
                    var key = i.replace(pnRe, '').replace(/^(\w)/, replaceFunction);
                    if (key !== '') {
                        options[key] = value;
                    }
                }
            }

            return options;
        },
        setCookie: function(cname, cvalue, exdays) {
            var d = new Date();
            d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
            var expires = "expires=" + d.toUTCString();
            document.cookie = cname + "=" + cvalue + "; " + expires;
        },

        getCookie: function(cname) {
            var name = cname + "=";
            var ca = document.cookie.split(';');
            for (var i = 0; i < ca.length; i++) {
                var c = ca[i];
                while (c.charAt(0) == ' ') c = c.substring(1);
                if (c.indexOf(name) != -1) return c.substring(name.length, c.length);
            }
            return "";
        }
    };



    var template = function t(s,d){
        for(var p in d)
            s=s.replace(new RegExp('{'+p+'}','g'), d[p]);
        return s;
    };



    var AppliscopeChart = context.AppliscopeChart = function () {
        this.init.apply(this, arguments);
    };


    AppliscopeChart.prototype = {
        constructor: AppliscopeChart.prototype.constructor,
        options: {
            count:3
        },
        complete: function(){
            if (this.options.fx) {
                this.$element[this.options.fx]();
            }
        },
        images: function(){
            var images = this.$element.find('img[data-src]') ;
            images.each(function(index,image){
               $(image).attr('src',$(image).attr('data-src'));
            });
            this.complete();
            return this ;
        },
        renderItems: function(html){
            var that = this ;
            $.each(this.data.appdesclist, function(i, item){
                if (i < that.options.count) {
                    var desc = item.description_text.length > 96 ? item.description_text.substr(0,96) + " ..." : item.description_text ;
                    item.description_text = desc ;
                    var el = template(html, item);
                    that.$element.append(el);
                }
            });
        },
        render: function(){
            
            
            var html = this.$element.find(".tpl").html();
            this.$element.find(".tpl").remove();

            this.renderItems(html);

            
            this.images();
            return this ;
        },
        remove: function(){
            this.$element.remove();
        },
        getData: function(){
            var that = this;
            console.log(this.options.source);
            $.ajax({
                url: this.options.source,
                success: function(data){
                    that.data = data ;
                    that.render();
                }
            });
        },
        /**
         * Constructor
         */
        init: function (element, options) {

            this.options = $.extend(true, {}, this.options, options, Utils.getOptionsFromDom('appliscope-chart', element));
            this.element = element;
            this.$element = $(element);
            this.data    = {};

            this.getData();


        }

    };


    //jquery plugin implementation
    $.fn.appliscopeChart = function (options) {
        return this.each(function () {
            if (!$(this).data('appliscope-chart')) {
                $(this).data('appliscope-chart', new AppliscopeChart(this, options));
            }
        });
    };
    $(document).ready(function(){
        $('[data-appliscope-chart]').appliscopeChart();
    });
    

})($sfr, window);

