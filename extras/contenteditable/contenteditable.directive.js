// This directive is derived from the angular api reference here:
// https://docs.angularjs.org/api/ng/type/ngModel.NgModelController

angular.module('contentEditableDemo.directives', [])
    .directive('contenteditable', contentEditable);

function contentEditable() {
    return {
        restrict: 'A',
        require: '?ngModel',
        link: function (scope, element, attrs, ngModel) {
            var $ctrl = scope.$ctrl;

            if (!ngModel) return;

            // specify how UI should be updated
            ngModel.$render = function() {
                element.html(ngModel.$viewValue || '');
            };

            element.on('focus', function () {
                debounce(highlightProhibitedWords, 250)();
            });

            element.on('blur', function () {
                var containerEl = element[0];

                $ctrl.util.removeAllMarkup(containerEl);

                var found = $ctrl.util.scanForProhibitedWords(containerEl, $ctrl.prohibitedWords);

                ngModel.$setValidity('myWidget', !found);

                scope.$evalAsync(read);
            });

            element.on('keydown', function (e) {
                var text = this.textContent.slice(0);
                var len = text.replace(/[\n\r]+/g, '').length;

                // maxlength: allow backspace and arrow left and right keys
                // prevent hard returns, which introduces bugs
                if ((len >= 50 && !/^(8|37|39)$/.test(e.keyCode)) || e.keyCode === 13) {
                    e.preventDefault();
                }

                // if space, left-arrow, or right-arrow, run check on prohibited words
                if (/^(32|37|39)$/.test(e.keyCode)) {
                    debounce(highlightProhibitedWords, 250)();
                } else {
                    scope.$evalAsync(read);
                }
            });

            read(); // initialize

            // write data to the model
            function read() {
                var html = element.html();
                var doInitialRender = false;

                // initialize if parent scope already has value
                // this ensures that a value is rendered on the initial load event
                if (!$ctrl.initialized) {
                    html = html === '' && $ctrl.userContent.length > 0 ? $ctrl.userContent : html;
                    $ctrl.initialized = true;
                    doInitialRender = true;
                }

                ngModel.$setViewValue(html);

                if(doInitialRender) {
                    ngModel.$render();
                }

                $ctrl.text = element.text();
            }

            function highlightProhibitedWords() {
                var containerEl = element[0];

                $ctrl.util.saveCaret(containerEl);

                var found = $ctrl.util.highlightAllProhibitedWords(containerEl, $ctrl.prohibitedWords);

                ngModel.$setValidity('myWidget', !found);

                $ctrl.util.restoreCaret(containerEl);

                scope.$evalAsync(read);
            }

            function debounce(func, wait, immediate) {
                var timeout;
                return function() {
                    var context = this, args = arguments;
                    var later = function() {
                        timeout = null;
                        if (!immediate) func.apply(context, args);
                    };
                    const callNow = immediate && !timeout;
                    clearTimeout(timeout);
                    timeout = setTimeout(later, wait);
                    if (callNow) func.apply(context, args);
                };
            }
        }
    };
}

contentEditable.$inject = [];