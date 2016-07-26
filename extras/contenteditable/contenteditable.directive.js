// This directive is derived from the angular api reference here:
// https://docs.angularjs.org/api/ng/type/ngModel.NgModelController

angular.module('contentEditableDemo.directives', [])
    .directive('contenteditable', contentEditable);

function contentEditable($sce) {
    return {
        restrict: 'A',
        require: '?^ngModel',
        link: function (scope, element, attrs, ngModel) {
            var $ctrl = scope.$ctrl;

            if (!ngModel) return;

            // specify how UI should be updated
            ngModel.$render = function() {
                element.html($sce.getTrustedHtml(ngModel.$viewValue || ''));
            };

            // listen for change events to enable binding
            element.on('blur keyup change', function() {
                scope.$evalAsync(read);
            });

            read(); // initialize

            // write data to the model
            function read() {
                var html = element.html();

                // initialize if parent scope already has value
                // this ensures that a value is rendered on the initial load event
                if (!$ctrl.initialized) {
                    html = html === '' && $ctrl.userContent.length > 0 ? $ctrl.userContent : html;
                    $ctrl.initialized = true;
                }

                ngModel.$setViewValue(html);
                ngModel.$render();
            }
        }
    };
}

contentEditable.$inject = ['$sce'];