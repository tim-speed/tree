
// require(['jquery', 'jquery.tree'], function ($) {
// 
// });

(function ($) {
  "use strict";
  
  function sort (element, decending, recursive) {
      var self = this
        , element = element ? $(element) : this.element
        , items = element.find('> li').get();

      if (!items.length) { 
        items = element.find('> ul > li').get();
        element = items.length ? element.find('> ul') : element;
      }

      if (items.length) {
        items.sort(function(a, b) {
          var $a = $(a)
            , $b = $(b);

          if ($a.find('> ul').length && !$b.find('> ul').length) {
            // order '$a' brefore '$b', '$a' is a branch and '$b' is a leaf
            return -1;
          }
          else if($b.find('> ul').length && !$a.find('> ul').length) {
            // order '$b' brefore '$a', '$b' is a branch and '$a' is a leaf
            return 1;
          } 

          // '$a' and '$b' are the same, sort by label
          return $a.text().toUpperCase().localeCompare($b.text().toUpperCase());
        });

        // if sort desc, reverse the list
        decending && items.reverse();

        $.each(items, function(idx, item) {
          element.append(item);
        });
      }

      recursive && element.find('> li > ul').each(function () { 
          self.sort(this, decending, recursive);
      });
  }
  

  $.fn.tree.plugin( 'sort', {
    _init: function() {
      this.sort = sort;
      this.sort(this.element, false, true);
    }
  });

})(window.jQuery);