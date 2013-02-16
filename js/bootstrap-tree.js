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

        // Attach expand/collapse mouseenter/hoverin event
        this.element.delegate('.tree-item-toggle', 'mouseenter', function (e) {
            var $target = $(this).closest('li')
                    .toggleClass('tree-item-toggle-hover', true);
        });

        // Attach expand/collapse mouseleave/hoverout event
        this.element.delegate('.tree-item-toggle', 'mouseleave', function (e) {
            var $target = $(this).closest('li')
                    .toggleClass('tree-item-toggle-hover', false);
        });

        // Attaches click handler to the expand/collapse element
        this.element.delegate('.tree-item-toggle', 'click', function () {
            self.toggle($(this).closest('li'));
            return false;
        });
      
        // Attaches click handler for selecting/activating a tree node
        this.element.delegate('[role="treeitem"] > :first-child', 'click', function(e) {
            self.select($(this).closest('li'))
        });
        
        // Manages renaming functionality by listening for click and focusout events
        // and setting the contenteditable attribute accordingly.
        this.element.delegate('.tree-item-label', 'click focusout', function(e) {
          var $this = $(this)
          , $li = $this.closest('li')
          , focused = $li.is('.selected')
          
          if (focused && e.type === 'click') {
            
            e = $.Event('rename', {
              target: $li[0]
            });
            
            $li.trigger(e);
            
            if (e.isDefaultPrevented()) return;
            
            $this.data('oldValue', $this.text()).attr('contenteditable', true).focus();
            
            return false;
          }
          else if (e.type === 'focusout' && $this.is('[contenteditable]')) {
            
            $this.removeAttr('contenteditable');
            
            e = $.Event('renamed', {
              oldValue: $this.data('oldValue')
            , newValue: $this.text()
            });
            
            $li.trigger(e);
          }
        });
      
      // initializes all plugins
      for(var plugin in plugins) {
         plugins[plugin]._init.apply(this, arguments);
      }

    };
  
    Tree.prototype = {
      constructor: Tree
      
    , collapse: function ( element ) {
        return this.toggle(element, false);
    }
    
    , expand: function ( element ) {
      return this.toggle(element, true);;
    }
      
    , select: function ( element ) {
        var $this = this.element
          , $target = $(element)
          , previous
          , e

        if ($target.hasClass('selected')) return this;

        previous = $this.data('selected') && $this.data('selected').length 
                  ? $this.data('selected') 
                  : $this.find('.selected:last')[0];

        e = $.Event('select', {
          relatedTarget: previous
        });

        $target.trigger(e);

        if (e.isDefaultPrevented()) return this;

        $(previous).removeClass('selected');
        $this.data('selected', $target.addClass('selected')[0]) 
        
        $target.trigger({
          type: 'selected'
        , relatedTarget: previous
        })
        
        return this;
      }
      
      
      , toggle: function ( element ) {
            var $this = this.element
              , $target = $(element)
              , $li
              , $ul
              , collapse
              , e;
              
            $li = $target.is('li') ? $target : $target.closest('li');
            $ul = $li.find('> ul');
            
            collapse = (arguments[1] !== undefined || arguments[1] !== null) 
              ? arguments[1] 
              : $ul.is(':visible');

            if ($ul.length) {
              
                e = $.Event(collapse ? 'collapse' : 'expand', {
                  target: $li[0]
                , relatedTarget: $ul[0]
                });

                $li.trigger(e);

                if (e.isDefaultPrevented()) return;
                
                $ul.is(':animated') && $ul.stop(true, true);
              
                $li
                  .toggleClass('tree-item-collapsed', collapse)
                  .toggleClass('tree-item-expanded', !collapse);
                
                $ul.toggle(60, function () {
                  e = $.Event(collapse ? 'collapsed' : 'expanded', {
                    target: $li[0]
                  , relatedTarget: $ul[0]
                  });

                  $li.trigger(e);
                });
            }
            
            return this;
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
