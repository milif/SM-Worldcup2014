"use strict";
/**
 * @ngdoc directive
 * @name stmwc.directive:stmwcShare
 * @function
 *
 * @requires stmwc.directive:stmwcShare:share.scss
 * @requires stmwc.directive:stmwcShare:share.html
 *
 * @description
 * Кнопки шаринга
 *
 * @element ANY
 *
 */

angular.module('stmwc').directive('stmwcShare', ['Share', function(Share){
    
    var SHARE = {
        url: $('meta[property="og:url"]').attr('content') || $('base').attr('href'),
        image: $('meta[property="og:image"]').attr('content'),
        title: $('meta[property="og:title"]').attr('content'),
        description: $('meta[property="og:description"]').attr('content')
    };
    
    return {
        templateUrl: 'partials/stmwc.directive:stmwcShare:share.html',
        replace: true,
        controller: ['$scope', '$stmwcAuth', function($scope, $stmwcAuth){
            
            var counters = $scope.counters = Share.get();
            
            $scope.click = function(type){
                click(type);
                switch(type){
                    case 'vk': 
                        clickVK();
                        break;
                    case 'fb': 
                        clickFB();
                        break;
                    case 'gp': 
                        clickGP();
                        break;
                    case 'ok': 
                        clickOK();
                        break;
                    case 'tw': 
                        clickTW();
                        break;
                }
            }
            
            function clickVK(){
                shareWindow("http://vk.com/share.php?url="
                                +encodeURIComponent(getUrl())
                                +(SHARE.title ?
                                "&description="+encodeURIComponent(SHARE.description)+"&title="+encodeURIComponent(SHARE.title)
                                :
                                "&title="+encodeURIComponent(SHARE.description)
                                )
                                +"&image="+encodeURIComponent(SHARE.image), 720, 550);
            }
            function clickFB(){
                shareWindow("http://www.facebook.com/sharer/sharer.php?u="+encodeURIComponent(getUrl()));
            }
            function clickTW(){
                shareWindow("https://twitter.com/intent/tweet?status=" + encodeURIComponent(SHARE.description + ' ' + getUrl()) + "&url="+encodeURIComponent(getUrl()));
            }
            function clickGP(){
                shareWindow("https://plus.google.com/share?url="+encodeURIComponent(getUrl())+"&t="+encodeURIComponent(SHARE.description));
            }
            function clickOK(){
                shareWindow("http://www.odnoklassniki.ru/dk?st.cmd=addShare&st.s=1&st._surl="+encodeURIComponent(getUrl())+"&st.comments="+encodeURIComponent(SHARE.description));
            } 
            function click(type){
                var response = Share.add(SHARE.url.replace($('base').attr('href'), '/').replace(/\w+:\/\/[^\/]+/, ''), type, function(){
                    if(response.success) {
                        counters[type]++;
                    }
                });
            }
            function getUrl(){
                 return SHARE.url + ($stmwcAuth.isAuth ? '?r=' + $stmwcAuth.data.refKey : '');
            }
        }]
    };
    function shareWindow(url, width, height){
        var screenWidth = $(window).width(),
            screenHeight = $(window).height(),
            width = Math.min(screenWidth, width || 600),
            height = Math.min(screenHeight, height || 435),
            top = Math.floor((screenHeight-height)/2),
            left = Math.floor((screenWidth-width)/2);

        window.open(url, "_blank", "left="+left+",top="+top+",width="+width+",height="+height+",resizable=no,scrollbars=yes,status=yes");
    }
    
}])
.factory('Share', ['$resource', function($resource){
    var Share = $resource('api/share.php');
    Share.add = function(uri, type, clbFn){   
        return Share.save({
            action: 'add',
            uri: uri,
            type: type
        }, clbFn);
    }
    return Share;
}]);