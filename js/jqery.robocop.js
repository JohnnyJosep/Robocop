(function ($) {

    var fontsize = 14;

    $.fn.paint = function (options) {
        var $self = $(this);
        var settings = $.extend({
            rows: 15,
            cols: 15
        }, options);

        fontsize = $self.width() / settings.rows * 0.77;

        for (var r = 0; r < settings.rows; r++) {
            var $row = $('<div class="fila" style="height:' + (100 / settings.rows) + '%"></div>')
            for (var c = 0; c < settings.cols; c++) {
                $('<div class="celda verde col-' + c + ' row-' + r + '" style="width:' + (100 / settings.cols) + '%"></div>').appendTo($row)
            }
            $row.appendTo($self);
        }

        return $self;
    }
    $.fn.putFigure = function ($celda, options) {
        var settings = $.extend({
            figure: 'bug'
        }, options);
        if ($celda.html() == "") {
            $('<div class="' + settings.figure + '" style="font-size:' + fontsize + 'px"><span><i class="fa fa-fw fa-' + settings.figure + '"></i></span></div>').appendTo($celda);
        }
    }

    $.fn.getCol = function () {
        var $self = $(this);

        var classes = $self.attr('class').split(' ');
        for (var i = 0; i < classes.length; i++) {
            if (classes[i].indexOf('col-') > -1) {
                return classes[i].substring(4);
            }
        }

        return -1;
    }
    $.fn.getRow = function () {
        var $self = $(this);

        var classes = $self.attr('class').split(' ');
        for (var i = 0; i < classes.length; i++) {
            if (classes[i].indexOf('row-') > -1) {
                return classes[i].substring(4);
            }
        }

        return -1;
    }
    $.fn.isEmpty = function (x, y) {
        return $('.col-' + x + '.row-' + y).html() == "" && $('.col-' + x + '.row-' + y).length > 0;
    }
    $.fn.isVisited = function (x, y) {
        return $('.col-' + x + '.row-' + y + '.visited').length > 0;
    }

    $.fn.moveNext = function () {
        var $self = $(this);
        var $celda = $self.parent();
        var x = $celda.getCol();
        var y = $celda.getRow();
        var $map = $('#map');

        var inner = $celda.html();

        if ($map.isEmpty(+x + 1, y) && !$map.isVisited(+x + 1, y)) {
            var sel = '.col-' + (+x + 1) + '.row-' + y;
            $(sel).html(inner);
            $celda.html('');
            $celda.addClass('visited');
        } else if ($map.isEmpty(x, +y + 1) && !$map.isVisited(x, +y + 1)) {
            var sel = '.col-' + x + '.row-' + (+y + 1);
            $(sel).html(inner);
            $celda.html('');
            $celda.addClass('visited');
        } else if ($map.isEmpty(+x - 1, y) && !$map.isVisited(+x - 1, y)) {
            var sel = '.col-' + (+x - 1) + '.row-' + y;
            $(sel).html(inner);
            $celda.html('');
            $celda.addClass('visited');
        } else if ($map.isEmpty(x, +y - 1) && !$map.isVisited(x, +y - 1)) {
            var sel = '.col-' + x + '.row-' + (+y - 1);
            $(sel).html(inner);
            $celda.html('');
            $celda.addClass('visited');
        }
        else if ($map.isEmpty(+x + 1, y)) {
            var sel = '.col-' + (+x + 1) + '.row-' + y;
            $(sel).html(inner);
            $celda.html('');
        } else if ($map.isEmpty(x, +y + 1)) {
            var sel = '.col-' + x + '.row-' + (+y + 1);
            $(sel).html(inner);
            $celda.html('');
        } else if ($map.isEmpty(+x - 1, y)) {
            var sel = '.col-' + (+x - 1) + '.row-' + y;
            $(sel).html(inner);
            $celda.html('');
        } else if ($map.isEmpty(x, +y - 1)) {
            var sel = '.col-' + x + '.row-' + (+y - 1);
            $(sel).html(inner);
            $celda.html('');
        }
    }

}(jQuery));