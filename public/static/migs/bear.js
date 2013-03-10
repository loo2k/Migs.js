define(function(require) {

    var $ = require('jquery');
    require('tooltip')($);
    $('a[data-toggle=tooltip]').tooltip();
    
});