angular.module('contentEditableDemo.components', [])
    .component('editBox', {
        templateUrl: './contenteditable.template.html',
        controller: contentEditableController
    });

function contentEditableController($scope, $element) {

    this.initialized = false;
    this.userContent = 'thar be red in here';

}

contentEditableController.$inject = ['$scope', '$element'];