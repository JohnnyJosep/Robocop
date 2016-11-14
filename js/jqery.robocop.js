(function ($) {
    var fontsize = 14;
    var bugsCount = 0;
    var debug = 0;
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
    function log(msg) {
        if (debug > -1) console.log((debug++) + ".-" + msg);
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
    function isItFreeSpace(pos, states) {
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
        } else if (pos == 'e') {
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
        $bug.addClass('last-' + move)
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
        $('.col-' + currx + '.row-' + curry + " > .bug");
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

        var states = getState($self, $map);
        var allowed = getAllowed(states);
        var aindex = allowedIndex(allowed);

        if (aindex != -1) { //si un solo movimiento esta permitido (passillo estrecho sin salida) 'pwe'
            $self.addClass('pwe');
            moveTo(x, y, aindex, $self);
            return $self;
        } else {
            if ($self.hasClass('pwe')) {
                log('pasillo');
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
                        if (isItFreeSpace('se', states) === false &&
                            isItFreeSpace('so', states) === false &&
                            isItFreeSpace('o',  states) === true  &&
                            isItFreeSpace('e',  states) === true) {
                            // estamos en el primer caso donde debemos girar en el orden 
                            // preestablecido (N-O-S-E) o bien segun una de las opciones
                            // contrarias en la celda
                            var lastDir = getNum($cell, 'lastdir' + idBug + '-');
                            removeNum($cell, 'lastdir' + idBug);
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
                            removeNum($cell, 'lastdir' + idBug);
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
                        if (isItFreeSpace('ne', states) === false &&
                            isItFreeSpace('no', states) === false &&
                            isItFreeSpace('o', states) === true &&
                            isItFreeSpace('e', states) === true) {
                            var lastDir = getNum($cell, 'lastdir' + idBug + '-');
                            removeNum($cell, 'lastdir' + idBug);
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
                            removeNum($cell, 'lastdir' + idBug);
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
                        if (isItFreeSpace('so', states) === false &&
                            isItFreeSpace('no', states) === false &&
                            isItFreeSpace('s', states) === true &&
                            isItFreeSpace('n', states) === true) {
                            var lastDir = getNum($cell, 'lastdir' + idBug + '-');
                            removeNum($cell, 'lastdir' + idBug);
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
                            removeNum($cell, 'lastdir' + idBug);
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
                        if (isItFreeSpace('se', states) === false &&
                            isItFreeSpace('ne', states) === false &&
                            isItFreeSpace('s', states) === true &&
                            isItFreeSpace('n', states) === true) {
                            var lastDir = getNum($cell, 'lastdir' + idBug + '-');
                            removeNum($cell, 'lastdir' + idBug);
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
                            removeNum($cell, 'lastdir' + idBug);
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
                log('no pasillo');
                // podriamos aparecer al inicio en un pasillo el cual no tendriamos controlado
                // por lo que deberemos comprobar si estamos en uno y en tal caso seleccionar 
                // el movimiento logico por orden y marcar el pasillo
                // hay que considerar que las dos opciones del pasillo estan accesibles
                if (isItFreeSpace('n', states) == false && isItFreeSpace('s', states) == false) {
                    log('aparecemos en pasillo');
                    $self.addClass('pwe');
                    moveTo(x, y, 1, $self);
                    $cell.addClass('lastdir' + idBug + '-1');
                    return $self;
                }
                if (isItFreeSpace('e', states) == false && isItFreeSpace('o', states) == false) {
                    log('aparecemos en pasillo');
                    $self.addClass('pwe');
                    moveTo(x, y, 0, $self);
                    $cell.addClass('lastdir' + idBug + '-0');
                    return $self;
                }


                // enrada a pasillo estrecho:
                // primero habra que reconocer todas las posibles entradas a pasillos estrechos
                // pasillos : Norte, Oeste, Sur, Este
                var pasillos = [false, false, false, false];
                if (isItFreeSpace('no', states) == false &&
                    isItFreeSpace('ne', states) == false &&
                    isItFreeSpace('n', states) == true) {
                    pasillos[0] = true;
                }
                if (isItFreeSpace('no', states) == false &&
                    isItFreeSpace('so', states) == false &&
                    isItFreeSpace('o', states) == true) {
                    pasillos[1] = true;
                }
                if (isItFreeSpace('so', states) == false &&
                    isItFreeSpace('se', states) == false && 
                    isItFreeSpace('s', states) == true) {
                    pasillos[2] = true;
                }
                if (isItFreeSpace('ne', states) == false &&
                    isItFreeSpace('se', states) == false &&
                    isItFreeSpace('e', states) == true) {
                    pasillos[3] = true;
                }

                // si hay pasillos estrechos debemos escojer aquel que aun no hemos explorado
                // o bien segun lo que marque la celda o segun el orden preestablecido
                // finalmente hay que activar la marca 'pwe' para que explore todo el pasillo
                var nextDirs = [];
                for (var i = 0; i < pasillos.length; i++) {
                    if (pasillos[i] == true) {
                        nextDirs.push(i);
                    }
                }
                if (nextDirs.length > 0) {
                    log('entrada a pasillo');
                    var lastDir = getNum($cell, 'lastdir' + idBug + '-');
                    removeNum($cell, 'lastdir' + idBug);
                    $self.addClass('pwe'); // marcamos como pasillo estrecho
                    if (lastDir == -1) {
                        moveTo(x, y, nextDirs[0], $self);
                        $cell.addClass('lastdir' + idBug + '-' + nextDirs[0]);
                    } else {
                        var nextDir = (lastDir + 1) % 4;
                        while (!$.inArray(nextDir, nextDirs)) {
                            nextDir = (lastDir + 1) % 4;
                        }
                        moveTo(x, y, nextDir, $self);
                        $cell.addClass('lastdir' + idBug + '-' + nextDir);
                    }

                    return $self;
                }

                // llegados a este punto no estamos ante pasillos estrechos
                // estudiemos la posibilidad de estar rodeando una figura
                // en caso de no haber alguna segiremos hacia el norte
                var x0 = !(isItFreeSpace('n', states) == true && isItFreeSpace('no', states) == true);
                var x1 = !(isItFreeSpace('o', states) == true && isItFreeSpace('so', states) == true);
                var x2 = !(isItFreeSpace('s', states) == true && isItFreeSpace('se', states) == true);
                var x3 = !(isItFreeSpace('e', states) == true && isItFreeSpace('ne', states) == true);

                log('estados: ' + x0 + ", " + x1 + ", " + x2 + ", " + x3)

                if (x3 && !x0 ) {
                    moveTo(x, y, 0, $self);
                    return $self;
                }
                if (x0 && !x1) {
                    moveTo(x, y, 1, $self);
                    return $self;
                }
                if (x1 && !x2 ) {
                    moveTo(x, y, 2, $self);
                    return $self;
                }
                if (x2 && !x3) {
                    moveTo(x, y, 3, $self);
                    return $self;
                }

                if (isItFreeSpace('n', states) == true) {
                    moveTo(x, y, 0, $self);
                    return $self;
                } else if (isItFreeSpace('o', states) == true) {
                    moveTo(x, y, 1, $self);
                    return $self;
                } else if (isItFreeSpace('s', states) == true) {
                    moveTo(x, y, 2, $self);
                    return $self;
                } else if (isItFreeSpace('e', states) == true) {
                    moveTo(x, y, 3, $self);
                    return $self;
                }

                //no hay movimiento posible
                log('no hay movimiento posible');
                return $self;
            }
        }


    }

}(jQuery));