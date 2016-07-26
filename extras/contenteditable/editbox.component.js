angular.module('contentEditableDemo.components', [])
    .component('editBox', {
        templateUrl: './contenteditable.template.html',
        controller: contentEditableController
    });

function contentEditableController($scope, $element) {

    this.initialized = false;
    this.userContent = 'thar be red in here';
    this.text = this.userContent;
    this.prohibitedWords = ['red', 'blue', 'green'];
    this.util = contentEditableUtil;

}

contentEditableController.$inject = ['$scope', '$element'];