
// http://jsfiddle.net/ys66u/8

(function ($) {
  "use strict";

  $.fn.tree.plugin( 'checkbox', {
    _init: function() {
      var $tree = this.element;
      
      $tree.find('li').delegate('> label > :checkbox').on('change', function (e) {
        e.stopPropagation();
        
        var $li = $(this)
          , $checkbox = $(e.target).removeClass('indeterminate');
        
        $li
          .find('[role="treeitem"] > label > :checkbox')
          .prop('checked', $checkbox.is(':checked'))
          .prop('indeterminate', false);
        
        $li
          .parentsUntil('[role="tree"]', 'li')
          .each(function () {
            var $parent = $(this)
              , $children = $parent.find('> ul > li > label > :checkbox')
              , indeterminate = $children.is(':checked') && $children.is(':not(:checked)') || $children.is('.indeterminate');
            
            $parent.find('> label > :checkbox')
              .prop('checked',  $children.length === $children.filter(':checked').length)
              .prop('indeterminate', indeterminate)
              .toggleClass('indeterminate', indeterminate);
          });
      });
    }
  });

})(window.jQuery);