(function(angular) {
    'use strict';

    angular.module('contentEditableDemo', [
        'ngSanitize',
        'contentEditableDemo.directives',
        'contentEditableDemo.components'
    ]);

})(window.angular);

angular.element(document).ready(function() {
    angular.bootstrap(document, ['contentEditableDemo'], { strictDi: true });
});