(function ($) {
    var bc = [];
    var dim = 17;
    $.getJSON('/json/bc.json', function (data) {
        $.each(data, function (key, val) {
            bc.push(val);
        });
    });
    function getState(state) {
        for (var i = 0; i < bc.length; i++) {
            if (bc[i].n === state.n &&
                bc[i].no === state.no &&
                bc[i].o === state.o &&
                bc[i].so === state.so &&
                bc[i].s === state.s &&
                bc[i].se === state.se &&
                bc[i].e === state.e &&
                bc[i].ne === state.ne) {
                return bc[i];
            }
        }
        return null;
    };
    function getDir(dir, last) {
        var dirs = dir.split(' ');
        if (last != undefined) {
            for (var i = 0; i < dirs.length; i++) {
                if (dirs[i].indexOf('dir-' + last) == 0 || dirs[i].indexOf('last-' + last) == 0) {
                    return dirs[i].substring(dirs[i].length - 1);
                }
            }
        }
        return dirs[0].substring(4, 5);;
    };

    $.fn.init = function (position, whites) {
        var $self = $(this);
        var trans = false;
        if (dim % 2 == 0) {
            trans = true;
            dim++;
        }

        $self.addClass('dim-' + dim);
        for (var i = 0; i < dim * 2 - 1; i++) {
            $('<div class="linea fila-' + i + '"></div>').appendTo($self);
        }

        var sf = 0;
        for (var col = 0; col < dim; col++) {
            var fila = sf++;
            for (var row = 0; row < dim; row++) {
                if (trans && (col == 0 || row == 0)) {
                    $('<div class="col-' + col + ' row-' + row + ' tierra"><img src="imgs/forat.png" /></div>').appendTo($('.fila-' + fila));
                } else {
                    $('<div class="col-' + col + ' row-' + row + ' tierra"><img class="cubo" src="imgs/tierra.png" /><img class="roca" src="imgs/forat.png" /></div>').appendTo($('.fila-' + fila));
                }
                fila++;
            }
        }
        return $self;
    };
    $.fn.getNum = function (prefix) {
        var classes = $(this).attr('class').split(' ');
        for (var i = 0; i < classes.length; ++i) {
            if (classes[i].indexOf(prefix) > -1) {
                return classes[i].substring(prefix.length);
            }
        }
        return undefined;
    };
    $.fn.moveTo = function (dir) {
        var $self = $(this);

        var ml = $self.css('margin-left');
        var mt = $self.css('margin-top');
        ml = ml.substring(0, ml.length - 2);
        mt = mt.substring(0, mt.length - 2);

        var last = $self.getNum('last-');
        var c = $self.getNum('col-');
        var r = $self.getNum('row-');

        $self.removeClass('col-' + c).removeClass('row-' + r).removeClass('last-' + last);

        if (dir == 0) {
            ml = +ml - 50;
            mt = +mt + 29;
            r -= 1;
        } else if (dir == 1) {
            ml = +ml + 50;
            mt = +mt + 29;
            c -= 1
        } else if (dir == 2) {
            ml = +ml + 50;
            mt = +mt - 29;
            r += 1;
        } else {
            ml = +ml - 50;
            mt = +mt - 29;
            c += 1;
        }

        $self.addClass('col-' + c).addClass('row-' + r).addClass('last-' + dir);
        $self.css({
            marginLeft: ml + "px",
            marginTop: mt + "px"
        });
        return $self;
    };
    $.fn.move = function ($map) {
        var c = $self.getNum('col-');
        var r = $self.getNum('row-');
    };

}(jQuery));