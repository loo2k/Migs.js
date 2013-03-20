define(function(require) {

    var $ = require('jquery');
    require('tooltip')($);
    $('a[data-toggle=tooltip]').tooltip();

    require('tab')($);

    $('.nav-tabs a').click(function(e) {
        e.preventDefault();
        $(this).tab('show');
    });

});