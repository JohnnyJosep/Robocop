(function ($) {
    var bc = [];
    $.getJSON('https://johnnyjosep.github.io/Robocop/json/bc.json', function (data) {
        $.each(data, function (key, val) {
            bc.push(val);
        });
        console.log(bc.length + " states");
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
        return dirs[0].substring(4, 5);
    };

    $.fn.initMap = function (dim, position, whites) {
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
                    $('<div class="col-' + col + ' row-' + row + ' tierra roca"><img src="imgs/forat.png" /></div>').appendTo($('.fila-' + fila));
                } else {
                    $('<div class="col-' + col + ' row-' + row + ' tierra"><img class="cubo" src="imgs/tierra.png" /><img class="cabra" src="imgs/cabra.png" /><img class="roca" src="imgs/roca.png" /></div>').appendTo($('.fila-' + fila));
                }
                fila++;
            }
        }
        //whites as array
        $.each(whites, function (i, v) {
            $('.tierra.col-' + v.col + '.row-' + v.row).addClass('roca');
        });

        $self.find('.tierra.col-' + position.col + '.row-' + position.row).addClass('cabra').removeClass('roca');

        $self.addClass('col-' + position.col).addClass('row-' + position.row);
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
        
        var last = $self.getNum('last-');
        var c = +$self.getNum('col-');
        var r = +$self.getNum('row-');

        $self.find('.tierra.cabra').removeClass('cabra');
        $self.removeClass('col-' + c).removeClass('row-' + r).removeClass('last-' + last);

        if (dir == 'n') {
            r -= 1;
            last = 's';
        } else if (dir == 'o') {
            c -= 1
            last = 'e'
        } else if (dir == 's') {
            r += 1;
            last = 'n'
        } else {
            c += 1;
            last = 'o'
        }

        $self.find('.tierra.col-' + c + '.row-' + r).addClass('cabra');
        $self.addClass('col-' + c).addClass('row-' + r).addClass('last-' + last);
        return $self;
    };
    $.fn.blockState = function (col, row) {
        var $self = $(this);
        return $self.find('.tierra.col-' + col + '.row-' + row).length === 0 || $self.find('.tierra.col-' + col + '.row-' + row).hasClass('roca') ? 'wall' : 'empty';
    }
    $.fn.seach = function () {
        var $self = $(this);
        var last = $self.getNum('last-');
        var c = +$self.getNum('col-');
        var r = +$self.getNum('row-');

        var state = {
            n: $self.blockState(c, r - 1),
            no: $self.blockState(c - 1, r - 1),
            o: $self.blockState(c - 1, r),
            so: $self.blockState(c - 1, r + 1),
            s: $self.blockState(c, r + 1),
            se: $self.blockState(c + 1, r + 1),
            e: $self.blockState(c + 1, r),
            ne: $self.blockState(c + 1, r - 1)
        };

        //console.log(state);
        var premisa = getState(state);
        //console.log(premisa);

        $self.moveTo(getDir(premisa.dir, last));
        return $self;
    }

}(jQuery));