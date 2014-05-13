"use strict";
/**
 * @ngdoc directive
 * @name stmwc.directive:stmwcLayoutSidebar
 * @function
 *
 * @requires stmwc.directive:stmwcLayoutSidebar:layoutsidebar.scss
 *
 * @description
 * Лайаут сайдбара
 *
 * @element ANY
 */
angular.module('stmwc').directive('stmwcLayoutSidebar', function(){
    var $ = angular.element;
    return {
        template: function(tEl){
            var tpl = 
                '<div class="l-content">' +
                    '<div class="l-main-content">'+tEl.find('content').html()+'</div>' +
                    '<div class="l-sidebar">'+tEl.find('sidebar').html()+'</div>' +
                '</div>';
            
            return tpl;
        }
    };
});
