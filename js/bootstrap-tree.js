/* ===================================================
 * bootstrap-tree.js v1.0.0
 * http://markmurphy.github.com/tree
 * ===================================================
 * Copyright 2013 Mark Murphy
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * ========================================================== */


/**
 * API Methods
 * ======
 * add (appendTo, prependTo, insertBefore, insertAfter)
 * |-child
 * |-siblingBefore
 * |-siblingAfter
 * move (appendTo, prependTo, insertBefore, insertAfter)
 * |-before
 * |-after
 * delete (remove)
 * 
 * 
 *@TODO: Events
 *
 *onSelect
 *onBeforeSelect
 *onDeselect
 *onBeforeDeselect
 *onActivate
 *onBeforeActivate
 *onLazyLoad
 *
 * 
 * @param {function} $
 * @returns {undefined}
 */
(function ($) {
    "use strict";
    
    var plugins = {};

    var Tree = function (element, options) {
      
        this.element = $(element);
        this.options = options = $.extend({}, $.fn.tree.defaults, options);

        var self = this
          , $element = self.element.attr('role', 'tree');
        
        if (options.children) {
          var children = (typeof options.children === 'string') 
            ? $.parseJSON(options.children) 
            : options.children;
            
          $(children).each(function() {
            addChild(this, element);
          });
        }
      
        function addChild (node, parent) {
            var $child = $(options.template
                .replace(/{{title}}/, node.title)
                .replace(/{{children}}/, node.children ? '<ul role="group"></ul>' : ''));
            
            for (var key in node) {
              $child.data(key, node[key]);
            }
          
            node.attr && $child.attr(node.attr);
            
            if (node.children && node.children.length) {
              $(node.children).each(function () {
                addChild(this, $child.find('> ul')[0]);
              });
            }

            $(parent).append($child);
        }

        // Properly space/offset our nested list hierarchy
        applyLevelOffsets($element.find('> li'), 0);

        function applyLevelOffsets (children, level) {
            children && children.length && children.each(function() {
                var $li = $(this)
                  , $children = $li.find('> ul > li')
                  , offset = {};
                
                offset[options.levelOffetPropery] = (options.levelOffset * level) + options.levelOffsetUnit;
                  
                // Add level offset
                $li.attr('role', 'treeitem')
                   .find('> :first-child')
                   .animate(offset, 0);

                if ($children.length) {
                    // This node contains a sub-tree
                    $li.attr('aria-expanded', 'true')
                       .addClass('collapsible tree-item-expanded')
                       .children('ul')
                       .attr('role', 'group');

                    applyLevelOffsets($children, level + 1);
                }
            });
        }
      
        self.sort(element, false, true);

        // Attach expand/collapse mouseenter/mouseleave hover events
        this.element.delegate('.tree-item-toggle', 'mouseenter', function(e) {
            $(this).closest('li').toggleClass('tree-item-toggle-hover');
        });

        this.element.delegate('.tree-item-toggle', 'mouseleave', function(e) {
            $(this).closest('li').removeClass('tree-item-toggle-hover');
        });


        // Attaches click handler to the expand/collapse icon
        this.element.delegate('.tree-item-toggle', 'click', function(e) {
            var $this = $(this)
              , $li = $this.closest('li')
              , $ul = $li.find('> ul')
              , visible;

            if ($ul.is(':animated')) {
                $ul.stop(true, true);
            }

            visible = $ul.is(':visible');
 
            if ($ul.length) {
                $li.removeClass(visible ? 'tree-item-expanded' : 'tree-item-collapsed')
                    .addClass(visible ? 'tree-item-collapsed' : 'tree-item-expanded');
                
                $ul.toggle(60);
            }
 
            // prevent parent handler from triggering
            return false;
        });
      
      
        // Attaches click handler for selecting/activating a tree node
        this.element.delegate('[role="treeitem"] > :first-child', 'click', function(e) {
            self.select($(this).closest('li'))
        });
      
        for(var plugin in plugins) {
           plugins[plugin]._init.apply(this, arguments);
        }

    };
  
    Tree.prototype = {
      constructor: Tree
      
    , select: function ( element ) {
        var $this = this.element
          , $target = $(element)
          , previous
          , e

        if ($target.hasClass('selected')) 
          return

        previous = $this.data('selected') && $this.data('selected').length 
                  ? $this.data('selected') 
                  : $this.find('.selected:last')[0]

        e = $.Event('beforeselect', {
          relatedTarget: previous
        })

        $target.trigger(e)

        if (e.isDefaultPrevented())
          return

        $(previous).removeClass('selected');
        $this.data('selected', $target.addClass('selected')[0]) 
        
        $this.trigger({
          type: 'select'
        , relatedTarget: previous
        })
      }
    
    , sort: function (element, decending, recursive) {
            var self = this
              , element = $(element)
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
    };

    /* TREE PLUGIN DEFINITION
     * ===================== */

    var old = $.fn.tree;

    $.fn.tree = function (option) {
        return this.each(function () {
            var $this = $(this)
              , data = $this.data('tree')
              , options = typeof option === 'object' && option;
            if (!data) $this.data('tree', (data = new Tree(this, options)));
            if (typeof option === 'string') data[option]();
        });
    };

    $.fn.tree.defaults = { 
      children: null
    , levelOffset: 16
    , levelOffsetUnit: 'px'
    , levelOffetPropery: 'padding-left'
    , template: '<li>'
              +   '<label>'
              +     '<b class="tree-item-toggle" role="presentation"></b>&nbsp;'
              +     '<i class="tree-item-icon icon-file"></i>&nbsp;'
              +     '<span class="tree-item-label">{{title}}</span>&nbsp;'
              +   '</label>'
              +   '{{children}}'
              + '</li>'
    };
  
    $.fn.tree.plugin = function( name, definition ) {
      plugins[name] = definition;
    };

    $.fn.tree.Constructor = Tree;

    /* TREE NO CONFLICT
     * =============== */

    $.fn.tree.noConflict = function () {
        $.fn.tree = old;
        return this;
    }; 

})(window.jQuery);
