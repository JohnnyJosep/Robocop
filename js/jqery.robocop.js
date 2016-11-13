(function ($) {
    var fontsize = 14;
    var bugsCount = 0;
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
            $('<div class="' + settings.figure + '-' + (bugsCount++) + '" style="font-size:' + fontsize + 'px"><span><i class="fa fa-fw fa-' + settings.figure + '"></i></span></div>').appendTo($celda);
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
    function getCurrentStateOf(pos, states) {
        if (pos == 'no') {
            return states[0]
        } else if (pos == 'o') {
            return states[1];
        } else if (pos == 'so') {
            return states[2];
        } else if (pos == 'n') {
            return states[3];
        } else if (pos == 's') {
            return states[4];
        } else if (pos == 'ne') {
            return states[5];
        } else if (pos = 'e') {
            return states[6];
        } else if (pos == 'se') {
            return states[7];
        }
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
        var idBug = getNum($self, 'bug-');
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
                    // > o ?     > o ·     > o ·
                    // m · x     m m ?     m · m
                    // se puede ver que se puede tomar cualquier direccion permitida excepto
                    // en el primer caso que solo podemos tomar aquellas direcciones que 
                    // generean un giro respecto de la direccion actual

                    if (last = 2) {
                        //venimos del norte
                        if (getCurrentStateOf('se', states) === false &&
                            getCurrentStateOf('so', states) === false &&
                            getCurrentStateOf('o',  states) === true  &&
                            getCurrentStateOf('e',  states) === true) {
                            // estamos en el primer caso donde debemos girar en el orden 
                            // preestablecido (N-O-S-E) o bien segun una de las opciones
                            // contrarias en la celda
                            var lastDir = getNum($cell, 'lastdir' + idBug +'-');
                            if (lastDir == -1) {
                                moveTo(x, y, 1, $self);//oeste
                                $cell.addClass('lastdir' + idBug + '-1');
                            } else {
                                var nextDir = (lastDir + 2) % 4; // movimiento opuesta al anterior
                                moveTo(x, y, nextDir, $self);
                                $cell.addClass('lastdir' + idBug + '-' + nextDir);
                            }
                            return $self;
                        } else {
                            // estamos en el seguno o tercer caso, continuamos el camino 
                            // segun el ordern preestablecido o el movimiento siguiente al
                            // anterior realizado
                            var lastDir = getNum($cell, 'lastdir' + idBug + '-');
                            if (lastDir == -1) {
                                moveTo(x, y, 1, $self);//oeste
                                $cell.addClass('lastdir' + idBug + '-1');
                            } else {
                                var nextDir = lastDir + 1 == 4 ? 1 : lastDir + 1; // saltamos N = 0
                                moveTo(x, y, nextDir, $self);
                                $cell.addClass('lastdir' + idBug + '-' + nextDir);
                            }
                            return $self;
                        }
                    } else if (last = 0) {
                        //venimos del sur (siguiendo el patron anterior)
                        if (getCurrentStateOf('ne', states) === false &&
                            getCurrentStateOf('no', states) === false &&
                            getCurrentStateOf('o', states) === true &&
                            getCurrentStateOf('e', states) === true) {
                            var lastDir = getNum($cell, 'lastdir' + idBug + '-');
                            if (lastDir == -1) {
                                moveTo(x, y, 1, $self);
                                $cell.addClass('lastdir' + idBug + '-1');
                            } else {
                                var nextDir = (lastDir + 2) % 4;
                                moveTo(x, y, nextDir, $self);
                                $cell.addClass('lastdir' + idBug + '-' + nextDir);
                            }
                            return $self;
                        } else {
                            var lastDir = getNum($cell, 'lastdir' + idBug + '-');
                            if (lastDir == -1) {
                                moveTo(x, y, 1, $self);//oeste
                                $cell.addClass('lastdir' + idBug + '-1');
                            } else {
                                var nextDir = lastDir + 1 == 2 ? 3 : lastDir + 1; // saltamos S = 2
                                moveTo(x, y, nextDir, $self);
                                $cell.addClass('lastdir' + idBug + '-' + nextDir);
                            }
                            return $self;
                        }
                    } else if (last = 1) {
                        //venimos del este (siguiendo el patron anterior)
                        if (getCurrentStateOf('so', states) === false &&
                            getCurrentStateOf('no', states) === false &&
                            getCurrentStateOf('s', states) === true &&
                            getCurrentStateOf('n', states) === true) {
                            var lastDir = getNum($cell, 'lastdir' + idBug + '-');
                            if (lastDir == -1) {
                                moveTo(x, y, 0, $self);//norte
                                $cell.addClass('lastdir' + idBug + '-0');
                            } else {
                                var nextDir = (lastDir + 2) % 4;
                                moveTo(x, y, nextDir, $self);
                                $cell.addClass('lastdir' + idBug + '-' + nextDir);
                            }
                            return $self;
                        } else {
                            var lastDir = getNum($cell, 'lastdir' + idBug + '-');
                            if (lastDir == -1) {
                                moveTo(x, y, 0, $self);//norte
                                $cell.addClass('lastdir' + idBug + '-0');
                            } else {
                                var nextDir = (lastDir + 1) % 3; // saltamos E = 3
                                moveTo(x, y, nextDir, $self);
                                $cell.addClass('lastdir' + idBug + '-' + nextDir);
                            }
                            return $self;
                        }
                    } else /*if (last = 1)*/ {
                        //venimos del oeste (siguiendo el patron anterior)
                        if (getCurrentStateOf('se', states) === false &&
                            getCurrentStateOf('ne', states) === false &&
                            getCurrentStateOf('s', states) === true &&
                            getCurrentStateOf('n', states) === true) {
                            var lastDir = getNum($cell, 'lastdir' + idBug + '-');
                            if (lastDir == -1) {
                                moveTo(x, y, 0, $self);//norte
                                $cell.addClass('lastdir' + idBug + '-0');
                            } else {
                                var nextDir = (lastDir + 2) % 4;
                                moveTo(x, y, nextDir, $self);
                                $cell.addClass('lastdir' + idBug + '-' + nextDir);
                            }
                            return $self;
                        } else {
                            var lastDir = getNum($cell, 'lastdir' + idBug + '-');
                            if (lastDir == -1) {
                                moveTo(x, y, 0, $self);//norte
                                $cell.addClass('lastdir' + idBug + '-0');
                            } else {
                                var nextDir = (lastDir + 1) % 4 == 1 ? 2 : (lastDir + 1) % 4; // saltamos O = 1
                                moveTo(x, y, nextDir, $self);
                                $cell.addClass('lastdir' + idBug + '-' + nextDir);
                            }
                            return $self;
                        }
                    }

                } else {
                    var dir = 0;
                    while ((allowed[dir] == false || dir == oposite) && dir < allowed.length) dir++;
                    if (dir == allowed.length) dir = oposite;
                    moveTo(x, y, dir, $self);
                    return $self;
                }
            } else {
                // falta por hacer
                // 1.- camino libre sin figuras
                // 2.- rodear una figura
                // 3.- entrada a pasillo estrecho donde marcamos como pwe al entrar en el (ojo cuadros sueltos)
            }
        }


    }

}(jQuery));