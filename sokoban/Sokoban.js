import {
    level1,
    level2
} from './maps.js'

class Sokoban {

    currentLevel = 0;
    multiplier = 50;

    colors = {
        empty: { fill: '#fdf5e6', stroke: '#fdf5e6' },
        wall: { fill: '#868687', stroke: '#505051' },
        block: { fill: '#d9ae0a', stroke: '#C79300' },
        success_block: { fill: '#4ccd5a', stroke: '#3ca448' },
        void: { fill: '#dfbbb1', stroke: '#ca8e7d' },
        player: { fill: '#4f99e8', stroke: '#3f7ab9' },
    }

    constructor() {
        this.canvas = document.getElementById("game");
        this.context = this.canvas.getContext("2d");
        this.width = this.canvas.width;
        this.height = this.canvas.height;

        this.info = {};
        this.map = [];
        this.map.push(level1);
        this.map.push(level2);
    }

    start() {
        this.setlevel(this.currentLevel);

        window.onkeydown = function (e) {
            let k = e.key;

            let [dx, dy, movecnt, px, py] = [0, 0, 0, this.player.x, this.player.y];

            switch (k) {
                case 'ArrowLeft':
                    dx = -1; dy = 0; break;
                case 'ArrowRight':
                    dx = 1; dy = 0; break;
                case 'ArrowUp':
                    dx = 0; dy = -1; break;
                case 'ArrowDown':
                    dx = 0; dy = 1; break;
                case 'a':
                    dx = -1; dy = 0; break;
                case 'd':
                    dx = 1; dy = 0; break;
                case 'w':
                    dx = 0; dy = -1; break;
                case 's':
                    dx = 0; dy = 1; break;
                default:
                    return;
            }

            if (movecnt = this.doMove(dx, dy)) {
                this.player.x += dx;
                this.player.y += dy;
                this.info.steps++;

                for (let i = 0; i <= movecnt; i++) {
                    this.paintCell(px + dx * i, py + dy * i);
                }
            }

            this.updateStat();
        }.bind(this)
    }

    setlevel() {
        this.context.clearRect(0, 0, this.width, this.height)

        this.info = {
            w: this.map[this.currentLevel]._map[0].length,
            h: this.map[this.currentLevel]._map.length,
            steps: 0
        };
    
        this.ox = (this.width - this.info.w * this.multiplier) / 2;
        this.oy = (this.height - this.info.h * this.multiplier) / 2;
    
        this.player = { x: -1, y: -1 };
    
        for (let i = 0; i < this.info.h; i++) this.map[this.currentLevel]._map[i] = this.map[this.currentLevel]._map[i].split("");
    
        for (let y = 0; y < this.info.h; y++)
            for (let x = 0; x < this.info.w; x++) {
                if (this.map[this.currentLevel]._map[y][x] == '@') {
                    this.player.x = x;
                    this.player.y = y;
                    this.map[this.currentLevel]._map[y][x] = ' ';
                }
                this.paintCell(x, y);
            }
        
        this.updateStat();
    }
    
    paintCell(x, y) {
        let cell = this.map[this.currentLevel]._map[y][x];
        this.context.fillStyle = "#000";
    
        switch (cell) {
            case 'X':
                cell = 'wall';
                break;
            case '*':
                cell = 'block';
                break;
            case '.':
                cell = 'void';
                break;
            case '%':
                cell = 'success_block';
                break;
            case ' ':
                cell = 'empty';
                break;
            case '@':
                cell = 'player';
                break;
            default:
                cell = '';
        }
    
        if (x == this.player.x && y == this.player.y) {
            cell = 'player'
        }
        
        if (cell === 'void' || cell === 'player') {
            const circleSize = cell === 'player' ? 20 : 10
    
            this.context.beginPath()
            this.context.rect(x * this.multiplier, y * this.multiplier, this.multiplier, this.multiplier)
            this.context.fillStyle = this.colors.empty.fill
            this.context.fill()
    
            this.context.beginPath()
            this.context.arc(x * this.multiplier + this.multiplier / 2, y * this.multiplier + this.multiplier / 2, circleSize, 0, 2 * Math.PI)
            this.context.lineWidth = 10
            this.context.strokeStyle = this.colors[cell].stroke
            this.context.fillStyle = this.colors[cell].fill
            this.context.fill()
            this.context.stroke()
        } else {
            this.context.beginPath()
            this.context.rect(x * this.multiplier + 5, y * this.multiplier + 5, this.multiplier - 10, this.multiplier - 10)
            this.context.fillStyle = this.colors[cell].fill
            this.context.fill()
    
            this.context.beginPath()
            this.context.rect(x * this.multiplier + 5, y * this.multiplier + 5, this.multiplier - 10, this.multiplier - 10)
            this.context.lineWidth = 10
            this.context.strokeStyle = this.colors[cell].stroke
            this.context.stroke()
        }
    }

    updateStat() {
        let estimate = 0, install = 0;

        for (let i = 0; i < this.info.h; i++)
            for (let j = 0; j < this.info.w; j++) {
                switch (this.map[this.currentLevel]._map[i][j]) {
                    case '.':
                        estimate++;
                        break;
                    case '%':
                        install++;
                        break;
                }
            }

        let text = 'Осталось: ' + estimate + '\nУстановлено: ' + install + '\nПройдено: ' + this.info.steps;
        if (estimate == 0) {
            if (++this.currentLevel < this.map.length) {
                this.setlevel();
            } else {
                this.context.fillStyle = this.colors.empty.fill
                this.context.fillRect(0, 0, this.width, this.height)
                this.context.font = 'bold 60px sans-serif'
                this.context.fillStyle = '#000'
                this.context.fillText('Вы выиграли!', 350, 300)
            }
        }
        document.getElementById('stats').innerHTML = text;

        let level = 'Уровень ' + (this.currentLevel + 1);
        if (this.currentLevel < this.map.length) {
            document.getElementById('level').innerHTML = level;
        }
    }

    doMove(dx, dy) {

        let [px, py] = [this.player.x, this.player.y];
        let b0 = this.map[this.currentLevel]._map[py + dy][px + dx];

        if (b0 == 'X') return 0;

        if (b0 == '*' || b0 == '%') {
            let b1 = this.map[this.currentLevel]._map[py + 2 * dy][px + 2 * dx];

            if (['X', '%', '*'].includes(b1)) {
                return 0;
            }

            this.map[this.currentLevel]._map[py + dy][px + dx] = (b0 == '%' ? '.' : ' ');
            this.map[this.currentLevel]._map[py + 2 * dy][px + 2 * dx] = (b1 == '.' ? '%' : '*');

            return 2;
        }
        return 1;
    }
}

export default Sokoban