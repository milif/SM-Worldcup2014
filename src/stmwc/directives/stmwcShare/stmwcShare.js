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
        controller: ['$scope', '$stmwcAuth', '$attrs', function($scope, $stmwcAuth, $attrs){
            
            var counters = $scope.counters = Share.get();
            var isShareBets = 'shareBets' in $attrs;
            var textShare = SHARE.description;
            
            $attrs.$observe('shareText', function(text){
                textShare = text || textShare;
            });
            
            $scope.click = function(type){
                if(isShareBets && !$stmwcAuth.isAuth) {
                    $stmwcAuth.auth();
                    return;
                }
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
                                "&description="+encodeURIComponent(textShare)+"&title="+encodeURIComponent(SHARE.title)
                                :
                                "&title="+encodeURIComponent(textShare)
                                )
                                +"&image="+encodeURIComponent(SHARE.image), 720, 550);
            }
            function clickFB(){
                shareWindow("http://www.facebook.com/sharer/sharer.php?u="+encodeURIComponent(getUrl()));
            }
            function clickTW(){
                shareWindow("https://twitter.com/intent/tweet?status=" + encodeURIComponent(textShare + ' ' + getUrl()) + "&url="+encodeURIComponent(getUrl()));
            }
            function clickGP(){
                shareWindow("https://plus.google.com/share?url="+encodeURIComponent(getUrl())+"&t="+encodeURIComponent(textShare));
            }
            function clickOK(){
                shareWindow("http://www.odnoklassniki.ru/dk?st.cmd=addShare&st.s=1&st._surl="+encodeURIComponent(getUrl())+"&st.comments="+encodeURIComponent(textShare));
            } 
            function click(type){
                var response = Share.add(SHARE.url.replace($('base').attr('href'), '/').replace(/\w+:\/\/[^\/]+/, ''), type, function(){
                    if(response.success) {
                        counters[type]++;
                    }
                });
            }
            function getUrl(){
                var params = [];
                if($stmwcAuth.isAuth){
                    params.push('r=' + $stmwcAuth.data.refKey);
                } 
                if(isShareBets && $stmwcAuth.isAuth) {
                    params.push('share=' + $stmwcAuth.data.share);
                }
                return SHARE.url + (params.length > 0 ? '?'+params.join('&') : '');
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