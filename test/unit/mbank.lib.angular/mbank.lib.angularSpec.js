'use strict';

describe('mbank.lib.angular', function() {

  var module;
  var dependencies;

  dependencies = [];

  var hasModule = function(module) {
    return dependencies.indexOf(module) >= 0;
  };

  beforeEach(function() {
    // Get module
    module = angular.module('mbank.lib.angular');
    dependencies = module.requires;

  }); 

  it('should load config module', function() {
    expect(hasModule('mbank.lib.angular.config')).to.be.ok;
  });

  describe('$mbankApi', function () {
//      var $mbankApi, $http, $httpBackend;
//      beforeEach(inject(function (_$mbankApi_, _$http_, _$httpBackend_) { //injecting $mbank service
//          $mbankApi = _$mbankApi__;
//          $httpBackend = _$httpBackend_;
//          $http = _$http_;
//      }));

      describe("$$request", function () {
          it('should return same value, as API', function () {

          });
      });
  });

});
