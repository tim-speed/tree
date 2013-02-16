jQuery(document).ready(function ($) {
  
    $('#demo3').tree({
      children: '[{"title": "Item 1", "expand": "false", "children": [{"title": "Item 1.1"}]}, {"title": "Item 2"}]'
    });
  
    $('#demo1, #demo2, #demo4')
      .tree()
      .on('select', function (e) {
        console.log(e);
      })
      .on('selected', function (e) {
        console.log(e);
      })
      .on('rename', function (e) {
        console.log(e);
      })
      .on('renamed', function (e) {
        console.log(e);
      })
      .on('togglemouseenter togglemouseleave', function (e) {
        //console.log(e);
      })
      .on('expand expanded', function (e) {
        console.log(e);
      })
      .on('collapse collapsed', function (e) {
        console.log(e);
      })
      .find('a[href^="#"]').on('click', function (e) {
        e.preventDefault();
      });
});
// http://jsfiddle.net/ys66u/8
