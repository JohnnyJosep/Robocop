(function ($) {
    $.fn.paint = function (options) {
        var $self = $(this);
        var settings = $.extend({
            rows: 15,
            cols: 15
        }, options);

        for (var r = 0; r < settings.rows; r++) {
            var $row = $('<div class="fila" style="height:' + (100 / settings.rows) + '%"></div>')
            for (var c = 0; c < settings.cols; c++) {
                $('<div class="celda verde col-' + c + ' row-' + r + '" style="width:' + (100 / settings.cols) + '%"></div>').appendTo($row)
            }
            $row.appendTo($self);
        }

        return $self;
    }
    $.fn.start = function (options) {
        var settings = $.extend({
            x: 0,
            y: 0
        }, options);

        $('<div class="bug"><span><i class="fa fa-fw fa-bug"></i></span></div>').appendTo($('.row-' + settings.x + '.col-' + settings.y));
    }
}(jQuery));