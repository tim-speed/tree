/**
 * API Methods
 * ======
 * add
 *   addChild
 *   addSiblingBefore
 *   addSiblingAfter
 * move
 * delete
 * 
 * 
 * Events
 * ======
 * onClick
 * onMouseEnter
 * onMouseLeave/Out
 */

(function($){
    
    var Tree = function(element, options) {
        this.element = $(element);
        this.options = options = $.extend({}, $.fn.tree.defaults, options);
        
        var self = this, 
                root = this.element.is('ul') ? this.element : this.element.find('> ul');
        
        root.attr('role', 'tree');

        // Properly space our nested list hierarchy
        offset(this.element.find('> li'), 0);
        
        function offset(children, level) {
            children && children.length && children.each(function() {
                var $li = $(this), 
                    nodes = $li.find('> ul > li');
                
                // Add level offset
                $li.attr('role', 'treeitem')
                        .find('> :first-child')
                        .css(options.levelOffetPropery, (options.levelOffset * level) + options.levelOffsetUnit);
                
                if (nodes.length) {
                    // This node contains a sub-tree
                    $li.attr('aria-expanded', 'true').addClass('collapsible tree-item-expanded');
                    
                    $li.children('ul').attr('role', 'group');
                    
                    offset(nodes, level + 1);
                }
            });
        }
        
        // Attach expand/collapse hover events
        this.element.delegate('.tree-item-toggle', 'mouseenter', function(e) {
            $(this).closest('li').toggleClass('tree-item-toggle-hover');
        });
    
        this.element.delegate('.tree-item-toggle', 'mouseleave', function(e) {
            $(this).closest('li').removeClass('tree-item-toggle-hover');
        });
        
        // Attach click handler to the expand/collapse icon
        this.element.delegate('.tree-item-toggle', 'click', function(e) {
            var $this = $(this), 
                $li = $this.closest('li'),
                $ul = $li.find('> ul'),
                visible;
            
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
    
        this.element.delegate('[role="treeitem"] > :first-child', 'click', function(e) {
            var $li = $(this).closest('li'),
                active;
            
            if ($li.not('.active')) {
                active = self.active && self.active.length ? self.active : root.find('[role="treeitem"].active');
                active.removeClass('active');
                self.active = $li.addClass('active');
            }
        });
    };

    /* TREE PLUGIN DEFINITION
     * ===================== */

    var old = $.fn.tree;

    $.fn.tree = function(option) {
        return this.each(function() {
            var $this = $(this), 
                data = $this.data('tree'), 
                options = typeof option === 'object' && option;
            if (!data) $this.data('tree', (data = new Tree(this, options)));
            if (typeof option === 'string') data[option]();
        });
    };

    $.fn.tree.defaults = {
        levelOffset: 16,
        levelOffsetUnit: 'px',
        levelOffetPropery: 'padding-left'
    };

    $.fn.tree.Constructor = Tree;

    /* TREE NO CONFLICT
     * =============== */

    $.fn.tree.noConflict = function() {
        $.fn.tree = old;
        return this;
    }; 
      
})(jQuery);
