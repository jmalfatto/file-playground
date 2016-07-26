angular.module('contentEditableDemo.components', [])
    .component('editBox', {
        templateUrl: './contenteditable.template.html',
        controller: contentEditableController
    });

function contentEditableController($scope, $element) {
    console.log('controller', arguments, this);
}

contentEditableController.$inject = ['$scope', '$element'];