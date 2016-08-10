(function() {
    'use strict';

    angular
        .module('monitorApp')
        .controller('MiddlewareController', MiddlewareController);

    MiddlewareController.$inject = ['$scope', '$state', 'Middleware', 'MiddlewareSearch', 'ParseLinks', 'AlertService', 'pagingParams', 'paginationConstants', 'Computer', 'MidSearch', 'AppSearch'];

    function MiddlewareController ($scope, $state, Middleware, MiddlewareSearch, ParseLinks, AlertService, pagingParams, paginationConstants, Computer, MidSearch, AppSearch) {
        var vm = this;
        vm.loadAll = loadAll;
        vm.loadAllCp = loadAllCp;
        vm.loadPage = loadPage;
        vm.predicate = pagingParams.predicate;
        vm.reverse = pagingParams.ascending;
        vm.transition = transition;
        vm.clear = clear;
        vm.search = search;
        vm.searchQuery = pagingParams.search;
        vm.currentSearch = pagingParams.search;
        vm.loadAll();
        vm.loadAllCp();

        function loadApp(middlewareapp) {
            AppSearch.query({
                query: middlewareapp.id
            }, onSuccessApp, onErrorApp);

            function onSuccessApp(data) {
                middlewareapp.applength = data.length;
            }
            function onErrorApp(error) {
                AlertService.error(error.data.message);
            }
        }

        function loadAllCp() {
            Computer.query({
                page: pagingParams.page - 1,
                size: paginationConstants.itemsPerPage,
                sort: sort()
            }, onSuccessCp, onErrorCp);
            function onSuccessCp(data, headers) {
                vm.links = ParseLinks.parse(headers('link'));
                vm.totalItems = headers('X-Total-Count');
                vm.queryCount = vm.totalItems;
                vm.computers = data;
                vm.page = pagingParams.page;
            }
            function onErrorCp(error) {
                AlertService.error(error.data.message);
            }
            function sort() {
                var result = [vm.predicate + ',' + (vm.reverse ? 'asc' : 'desc')];
                if (vm.predicate !== 'id') {
                    result.push('id');
                }
                return result;
            }
        }

        function loadAll () {
            if (pagingParams.search) {
                MiddlewareSearch.query({
                    query: pagingParams.search,
                    page: pagingParams.page - 1,
                    size: paginationConstants.itemsPerPage,
                    sort: sort()
                }, onSuccess, onError);
            } else if(pagingParams.words) {
                MidSearch.query({
                    query: pagingParams.words,
                    page: pagingParams.page - 1,
                    size: paginationConstants.itemsPerPage,
                    sort: sort()
                }, onSuccessMidd, onError);
            } else {
                Middleware.query({
                    page: pagingParams.page - 1,
                    size: paginationConstants.itemsPerPage,
                    sort: sort()
                }, onSuccess, onError);
            }
            function onSuccessMidd(data) {
                vm.middlewares = data;
                angular.forEach(data, function (middleware) {
                    loadApp(middleware);
                });
            }
            function sort() {
                var result = [vm.predicate + ',' + (vm.reverse ? 'asc' : 'desc')];
                if (vm.predicate !== 'id') {
                    result.push('id');
                }
                return result;
            }
            function onSuccess(data, headers) {
                vm.links = ParseLinks.parse(headers('link'));
                vm.totalItems = headers('X-Total-Count');
                vm.queryCount = vm.totalItems;
                vm.middlewares = data;
                angular.forEach(data, function (middleware) {
                    loadApp(middleware);
                });
                vm.page = pagingParams.page;
            }
            function onError(error) {
                AlertService.error(error.data.message);
            }
        }

        function loadPage (page) {
            vm.page = page;
            vm.transition();
        }

        function transition () {
            $state.transitionTo($state.$current, {
                page: vm.page,
                sort: vm.predicate + ',' + (vm.reverse ? 'asc' : 'desc'),
                search: vm.currentSearch
            });
        }

        function search (searchQuery) {
            if (!searchQuery){
                return vm.clear();
            }
            vm.links = null;
            vm.page = 1;
            vm.predicate = '_score';
            vm.reverse = false;
            vm.currentSearch = searchQuery;
            vm.transition();
        }

        function clear () {
            vm.links = null;
            vm.page = 1;
            vm.predicate = 'id';
            vm.reverse = true;
            vm.currentSearch = null;
            vm.transition();
        }

    }
})();