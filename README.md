# jambon
JavaScript Library


Usage example : 

(function () {

    define(function () {
        $.setConfig({
            cordova: false,
            paths: {
                js: "http://localhost:3000/static/js/app/",
                html: "http://localhost:3000/static/js/view/",
                route: "http://localhost:3000/"
            }
        });
        console.log('config loaded');
    });

    require(["text!customer.html", "customer.js"], function (customerTpl, customer) {
        return $.get('user/1/')
            .then(function (data) {
                var html = $.template(customerTpl, data);
                console.log('---------------customer.js loaded----------------');
                return $.append(html, document.body);
            })
            .catch(function (error) {
                console.log(error);
                return false;
            });
    });

    define(function () {
        return $.post('user/add', { firstname: 'David', lastname: 'Chabrier' })
            .then(function (data) {
                $.append(`<br/><p>${data}</p>`, $.find('.jumbotron').el);
            });
    });

})();
