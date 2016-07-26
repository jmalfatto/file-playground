(function(angular) {
    'use strict';

    // This demo is derived from the angular api reference here:
    // https://docs.angularjs.org/api/ng/type/ngModel.NgModelController

    angular.module('contentEditableDemo', [
        'ngSanitize',
        'contentEditableDemo.directives',
        'contentEditableDemo.components'
    ]);

})(window.angular);

angular.element(document).ready(function() {
    angular.bootstrap(document, ['contentEditableDemo'], { strictDi: true });
});