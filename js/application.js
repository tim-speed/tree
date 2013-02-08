jQuery(document).ready(function ($) {
  
    $('#demo3').tree({
      children: '[{"title": "Item 1", "expand": "false", "children": [{"title": "Item 1.1"}]}, {"title": "Item 2"}]'
    });
  
    $('#demo1, #demo2, #demo4').tree();
    
    $('#demo1').on('beforeselect', function (e) {
      console.log(e);
      //e.preventDefault();
    }).on('select', function (e) {
      console.log(e);
    });;
});
// http://jsfiddle.net/ys66u/8
