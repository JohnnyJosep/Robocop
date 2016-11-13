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
                $('<div class="celda verde pri-0 col-' + c + ' row-' + r + '" style="width:' + (100 / settings.cols) + '%"></div>').appendTo($row)
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

    $.fn.isEmpty = function (x, y) {
        return $('.col-' + x + '.row-' + y).html() == "" && $('.col-' + x + '.row-' + y).length > 0;
    }

    function getNum($obj, prefix) {
        var classes = $obj.attr('class').split(' ');
        for (var i = 0; i < classes.length; ++i) {
            if (classes[i].indexOf(prefix) > -1) {
                return +classes[i].substring(prefix.length);
            }
        }
        return -1;
    }

    function removeNum($obj, prefix) {
        var num = getNum($obj, prefix);
        $obj.removeClass(prefix + num);
    }

    //NO O SO N S NE E SE
    function getState($bug, $map) {
        var $celda = $bug.parent();
        var x = getNum($celda, 'col-');
        var y = getNum($celda, 'row-');
        var state = [];
        for (var i = +x - 1; i <= +x + 1; i++) {
            for (var j = +y - 1; j <= +y + 1; j++) {
                if (!(i == x && j == y)) {
                    var empty = $map.isEmpty(i, j);
                    //console.log(i + ", " + j + "\t" + empty);
                    state.push(empty);
                }
            }
        }
        return state;
    }
    //N O S E
    function getAllowed(state) {
        var allowed = [];
        allowed.push(state[3]);//nort
        allowed.push(state[1]);//oest
        allowed.push(state[4]);//sud
        allowed.push(state[6]);//est
        return allowed;
    }
    function allowedIndex(allowed) {
        var dir = -1
        for (var i = 0; i < allowed.length; i++) {
            if (allowed[i] === true && dir === -1) {
                dir = i;
            } else if (allowed[i] === true && dir !== -1) {
                return -1;
            }
        }
        return dir;
    }
    //move: N = 0; O = 1; S = 2; E = 3
    function moveTo(currx, curry, move, $bug) {
        removeNum($bug, 'last-');
        var $cell = $('.col-' + currx + '.row-' + curry);
        var inner = $cell.html();

        if (move == 0) {
            curry = +curry - 1;
        } else if (move == 1) {
            currx = +currx - 1;
        } else if (move == 2) {
            curry = +curry + 1;
        } else {
            currx = +currx + 1;
        }

        $cell.html('');
        $('.col-' + currx + '.row-' + curry).html(inner);
        $('.col-' + currx + '.row-' + curry + " > .bug").addClass('last-' + move)
    }
    function containsMoreThan(arr, num, obj) {
        var founded = 0;
        for (var i = 0; i < arr.length; i++) {
            if (arr[i] == obj) {
                founded++;
                if (founded > num) return true;
            }
        }
        return false;
    }

    $.fn.moveNext = function () {
        var $self = $(this);
        var $cell = $self.parent();
        var x = getNum($cell, 'col-');
        var y = getNum($cell, 'row-');
        var $map = $('#map');

        var inner = $cell.html();

        var state = getState($self, $map);
        var allowed = getAllowed(state);
        var aindex = allowedIndex(allowed);

        if (aindex != -1) { //si un solo movimiento esta permitido (passillo estrecho sin salida) 'pwe'
            $self.addClass('pwe');
            moveTo(x, y, aindex, $self);
            return $self;
        } else {
            if ($self.hasClass('pwe')) {
                var last = +getNum($self, 'last-');
                var oposite = (last + 2) % 4;
                if (containsMoreThan(allowed, 2, true)) {
                    // si acabos de salir de un pwe no volver a entrar en el. 
                    // para ello eliminamos la opcion contraria al movimiento realizado
                    allowed[oposite] = false;
                    $self.removeClass('pwe');

                    // Llegado este punto debemos escojer de entre las direcciones posibles
                    // la que nos deje pegados a la pared
                    // Despues marcar la celda con la decision tomada para cuando volvamos 
                    // a pasar por la celda escojer la decision contraria y hacer el 
                    // camino en forma de 8 rodeando todas las 'islas' que nos encontremos

                    // De forma simetrica (si salimos desde la izquierda)
                    // (m muro; x vacio; o posicion actual; · donde podemos ir)
                    // m · x     m · ?     m · ?
                    //   o ?       o ·       o ·
                    // m · x     m m ?     m · m
                    // se puede ver que se puede tomar cualquier direccion permitida excepto
                    // en el primer caso que solo podemos tomar aquellas direcciones que 
                    // generean un giro



                } else {
                    var dir = 0;
                    while ((allowed[dir] == false || dir == oposite) && dir < allowed.length) dir++;
                    if (dir == allowed.length) dir = oposite;
                    moveTo(x, y, dir, $self);
                    return $self;
                }


            }
        }


    }

}(jQuery));