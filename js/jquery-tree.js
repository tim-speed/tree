(function($){
    
    var Tree = function(element, options) {
        this.element = $(element);
        this.options = $.extend({}, $.fn.tree.defaults, options);

        var self = this;
        
        // Properly space our nested list hierarchy
        interate($(element).find('> li'), 0);
        
        function interate(children, level) {
            children && children.length && children.each(function() {
                var $li = $(this), 
                    nodes = $li.find('> ul > li');
                    
                $li.find('> :first-child').css({'padding-left': (self.options.childItemPadding * level) + 'px'});
                
                if (nodes.length) {
                    $li.addClass('collapsible').find('> :first-child .tree-expand-icon').addClass('open');
                    interate(nodes, level + 1);
                }
            });
        }
        
        // Attach expand/collapse hover events
        this.element.delegate('.tree-expand-icon', 'mouseenter', function(e) {
            $(this).closest('li').toggleClass('tree-item-icon-hover');
        });
    
        this.element.delegate('.tree-expand-icon', 'mouseleave', function(e) {
            $(this).closest('li').removeClass('tree-item-icon-hover');
        });
        
        // Attach click handler to the expand/collapse icon
        this.element.delegate('.tree-expand-icon', 'click', function(e) {
            var $this = $(this), 
                $ul = $this.closest('li').find('> ul'),
                visible;
            
            if ($ul.is(':animated')) {
                $ul.stop(true, true);
            }
        
            visible = $ul.is(':visible');
            
            if ($ul.length) {
                $this.removeClass(visible ? 'open' : 'closed').addClass(visible ? 'closed' : 'open');

                $ul.toggle(60);
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
        childItemPadding: 16
    };

    $.fn.tree.Constructor = Tree;

    /* TREE NO CONFLICT
     * =============== */

    $.fn.tree.noConflict = function() {
        $.fn.tree = old;
        return this;
    }; 
      
})(jQuery);
