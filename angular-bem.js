(function(angular) {

  if (!angular) {
    throw new Error('angular-bem: angular required');
  }

  // modName -> mod_name
  function formatName(s) {
    return s.replace(/[A-Z]/g, function(s) {return '-' + s.toLowerCase();});
  }

  var module = angular.module('tenphi.bem', []);

  module.directive('block', function($compile) {
    return {
      restrict: 'EA',
      controller: function BlockCtrl($scope, $element, $attrs) {

        if (!$attrs.block) return;

        var blockName = $attrs.block;
        this.name = blockName;

        $element.removeAttr('block');
        $element.addClass(blockName);
      }
    }
  });

  module.directive('element', function() {
    return {
      restrict: 'EA',
      require: ['^block', 'element'],
      controller: function ElementCtrl() {

      },
      link: function(scope, el, attrs, ctrls) {
        var blockCtrl = ctrls[0];
        var elementCtrl = ctrls[1];

        elementCtrl.names = [];

        if (!attrs.element) return;

        // handle multiple elements attached to one node
        elementCtrl.names = attrs.element.split(/\s/g);

        elementCtrl.names.forEach(function(name) {
          el.removeClass(name);
          el.addClass(blockCtrl.name + '__' + name);
        });

        el.removeAttr('element');
      }
    }
  });

  module.directive('mods', function() {

    return {
      restrict: 'A',
      require: ['^block', '?block', '?element'],
      link: function(scope, el, attrs, ctrls) {
        var blockCtrl = ctrls[0] || ctrls[1];
        var elementCtrl = ctrls[2];

        var longTemplate = '{block}__{element}_{mod}{value}';
        var shortTemplate = '{block}_{mod}{value}';
        var blockName = blockCtrl.name;

        function setMods() {
          var elementNames = (elementCtrl && elementCtrl.names) || [];

          if (!scope.mods) return;
          var mods = Object.keys(scope.mods);

          for (var i = 0, len = mods.length; i < len; i++) {
            var mod = mods[i];
            var modValue = scope.mods[mod];
            var modName = formatName(mod);

            var shortClass = blockName
              + '_' + modName
              + (typeof(modValue) === 'string' ? '_' + modValue : '');

            if (!elementNames.length) {
              if (modValue) {
                el.addClass(shortClass);
              } else {
                el.removeClass(shortClass);
              }
            } else {
              elementNames.forEach(function(elementName) {
                var longClass = blockName
                  + '__' + elementName
                  + '_' + modName
                  + (typeof(modValue) === 'string' ? '_' + modValue : '');

                if (modValue) {
                  el.addClass(longClass);
                } else {
                  el.removeClass(longClass);
                }
              });
            }
          }
        }

        scope.$watch('mods', setMods, true);

        el.removeAttr('mods');
      }
    }
  });

})(window.angular);