const LINE_TYPE_X = 1, LINE_TYPE_Y = 2, DELTA = 8;

var car, parking, gameBound, matching, result, canvas, ctx, timer
    pressCar = false,
    startMove = false,
    prevX = 0,
    currX = 0,
    prevY = 0,
    currY = 0,
    positions = [],
    number = 0,
    dir = 0,
    time = 60,
    intervalTimer = null,
    currentLevel = 0,
    isParking = false;

var lineColor = "rgb(191, 32, 38)",
    lineWidth = 6;

var startX, startY, endX, endY;

initLevel();
initOthers();
initCar();
initParking();
drawMap();
// drawRuler();
initTimer();

function initLevel() {
    const urlSearchParams = new URLSearchParams(window.location.search);
    const params = Object.fromEntries(urlSearchParams.entries());
    currentLevel = params['level'] - 1;

    if (LEVELS[currentLevel] == undefined) {
        currentLevel = 0
    }
}

function initTimer() {
    timer = document.getElementById('timer');
    timer.textContent = `Time: ${time}`;
}

function startTimer() {
    if (intervalTimer) return;

    intervalTimer = setInterval(function() {
        time--;
        timer.textContent = `Time: ${time}`;

        if (time == 0) {
            this.stopTimer()
        }
    }, 1000)
}

function stopTimer() {
    clearInterval(intervalTimer)
}

function initCar() {
    car = document.getElementById('car');
    car.style.left = `${LEVELS[currentLevel].CAR_SETTING.x}px`;
    car.style.top = `${LEVELS[currentLevel].CAR_SETTING.y}px`;
    car.style.width = `${LEVELS[currentLevel].CAR_SETTING.w}px`;
    car.style.height = `${LEVELS[currentLevel].CAR_SETTING.h}px`;
    car.src = `./images/${LEVELS[currentLevel].CAR_SETTING.i}`;
}

function initParking() {
    parking = document.getElementById('parking');
    parking.style.left = `${LEVELS[currentLevel].PARKING_SETTING.x}px`;
    parking.style.top = `${LEVELS[currentLevel].PARKING_SETTING.y}px`;
    parking.style.width = `${LEVELS[currentLevel].PARKING_SETTING.w}px`;
    parking.style.height = `${LEVELS[currentLevel].PARKING_SETTING.h}px`;
    parking.src = `./images/${LEVELS[currentLevel].PARKING_SETTING.i}`;
}

function initOthers() {
    gameBound = document.getElementById("game-bound");
    matching = document.getElementById('matching');
    result = document.getElementById('result');
}

function drawRuler() {
    startX = gameBound.offsetLeft;
    startY = gameBound.offsetTop;
    endX = startX + gameBound.offsetWidth;
    endY = startY + gameBound.offHeight;

    for (let i = 20; i < gameBound.offsetWidth; i = i + 20) {
        ctx.fillText(i, i, 10);
    }

    for (let i = 20; i < gameBound.offsetHeight; i = i + 20) {
        ctx.fillText(i, 5, i);
    }
}

function drawMap() {
    canvas = document.getElementById("canvas");
    ctx = canvas.getContext("2d");
    w = canvas.width;
    h = canvas.height;

    ctx.setLineDash([10, 4]);
    ctx.beginPath();

    let position;
    for (let i = 0; i < LEVELS[currentLevel].MAP_SETTING.length; i++) {
        position = LEVELS[currentLevel].MAP_SETTING[i];

        if (i == 0) {
            ctx.moveTo(position.x, position.y);
        } else if (position.isCurve) {
            ctx.bezierCurveTo(position.cp1x, position.cp1y, position.cp2x, position.cp2y, position.x, position.y);
        } else {
            ctx.lineTo(position.x, position.y);
        }
    }
    ctx.stroke();

    canvas.addEventListener("mousemove", function (e) {
        findxy('move', e)
    }, false);
    canvas.addEventListener("mousedown", function (e) {
        findxy('down', e)
    }, false);
    canvas.addEventListener("mouseup", function (e) {
        findxy('up', e)
    }, false);
    canvas.addEventListener("mouseout", function (e) {
        findxy('out', e)
    }, false);

    console.log(generateCheckLines());
}

function findxy(res, e) {
    let px = e.clientX - gameBound.offsetLeft,
        py = e.clientY - gameBound.offsetTop;

    if (res == 'down' && this.isMouseOnCar(px, py)) {
        pressCar = true;
        prevX = px;
        prevY = py;
        currX = prevX;
        currY = prevY;
        this.startTimer();
    }

    if (res == 'up' || res == "out") {
        // if (pressCar && this.isMouseOnParking(px, py)) {
        //     this.stopTimer();
        // }

        pressCar = false;
        startMove = false;
    }

    if (res == 'move' &&
        pressCar
        // pressCar &&
        // !this.isMouseOnCar(px, py)
    ) {
        // if (startMove) {
            prevX = currX;
            prevY = currY;
        // } else {
        //     prevX = px;
        //     prevY = py;
        //     startMove = true;
        // }
        currX = px;
        currY = py;

        this.draw();
        this.moveCar();
    }
}

function draw() {
    positions.push({x: currX, y: currY})
    ctx.setLineDash([]);
    ctx.beginPath();
    ctx.moveTo(prevX, prevY);
    ctx.lineTo(currX, currY);
    ctx.strokeStyle = lineColor;
    ctx.lineWidth = lineWidth;
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    ctx.stroke();
    ctx.closePath();
}

function moveCar() {
    if (number < positions.length) {
        car.style.top = `${positions[number].y - LEVELS[currentLevel].CAR_SETTING.h / 2}px`;
        car.style.left = `${positions[number].x - LEVELS[currentLevel].CAR_SETTING.w / 2}px`;
        if (number > 0) {
            var diffX = positions[number].x - positions[number - 1].x;
            var diffY = positions[number].y - positions[number - 1].y;
            dir = Math.atan2(diffY, diffX);
            if (Math.abs(diffY) > 1 || Math.abs(diffX) > 1) {
                let deg = 90 + Math.atan2(diffY, diffX) * 180 / Math.PI;
                if (Math.abs(deg) < 5) {
                    car.style.transform = `rotate(0deg)`
                }  else {
                    car.style.transform = `rotate(${deg}deg)`
                }
            }
        }
        number++;
    }

    window.requestAnimationFrame(() => {
        this.moveCar();
    });
}

function isMouseOnCar(px, py) {
    return px >= car.offsetLeft &&
        px <= car.offsetLeft + car.offsetWidth &&
        py >= car.offsetTop &&
        py <= car.offsetTop + car.offsetHeight
}

function isMouseOnParking(px, py) {
    return px >= parking.offsetLeft &&
        px <= parking.offsetLeft + parking.offsetWidth &&
        py >= parking.offsetTop &&
        py <= parking.offsetTop + parking.offsetHeight
}

function calculateScore() {
    let checkLines = this.generateCheckLines();
    let matchPoints = 0;

    let removeDuplicatedPoints = positions.filter((value, index, self) => {
        return index === self.findIndex((t) => {
            return t.x === value.x && t.y === value.y;
        });
    })

    let totalCheckedPoints = removeDuplicatedPoints.length;
    let maxCheckedPoints = 0;

    checkLines.forEach((checkLine) => {
        maxCheckedPoints += checkLine.numbers;
    })
    maxCheckedPoints = Math.round(maxCheckedPoints / (2 * DELTA + 1));

    let checked = false;
    removeDuplicatedPoints.forEach((point) => {
        checked = false;
        checkLines.forEach((checkLine) => {
            if (!checked &&
                checkLine.type == LINE_TYPE_X &&
                checkLine.x == point.x &&
                checkLine.min <= point.y &&
                checkLine.max >= point.y) {
                checked = true;
                matchPoints++;
            } else if (!checked &&
                checkLine.type == LINE_TYPE_Y &&
                checkLine.y == point.y &&
                checkLine.min <= point.x &&
                checkLine.max >= point.x) {
                checked = true;
                matchPoints++;
            }
        })
    })

    matching.textContent = `Matching: ${Math.round(matchPoints * 100 / totalCheckedPoints)}%`;

    console.log(`Match points: ${matchPoints} / Total: ${totalCheckedPoints} / ${Math.round(matchPoints * 100 / totalCheckedPoints)}%`);
}

function generateCheckLines() {
    let lines = [];
    let level = LEVELS[currentLevel].MAP_SETTING[currentLevel];

    for (let i = 1; i < level.length; i++) {
        if (level[i - 1].x == level[i].x) {
            for (let j = level[i].x - DELTA; j <= level[i].x + DELTA; j++) {
                lines.push({
                    type: LINE_TYPE_X,
                    x: j,
                    min: Math.min(level[i - 1].y, level[i].y),
                    max: Math.max(level[i - 1].y, level[i].y),
                    numbers: Math.abs(level[i].y - level[i - 1].y)
                });
            }
        }

        if (level[i - 1].y == level[i].y) {
            for (let j = level[i].y - DELTA; j <= level[i].y + DELTA; j++) {
                lines.push({
                    type: LINE_TYPE_Y,
                    y: j,
                    min: Math.min(level[i - 1].x, level[i].x),
                    max: Math.max(level[i - 1].x, level[i].x),
                    numbers: Math.abs(level[i].x - level[i - 1].x)
                });
            }
        }
    }

    return lines;
}

function addMissedPoints(removeDuplicatedPoints) {
    //add missed points
    for (let i = 1; i < removeDuplicatedPoints.length; i++) {
        if (removeDuplicatedPoints[i].x == removeDuplicatedPoints[i - 1].x) {
            if (removeDuplicatedPoints[i].y - removeDuplicatedPoints[i - 1].y > 1) {
                for (let i = 1; i < removeDuplicatedPoints[i].y - removeDuplicatedPoints[i - 1].y; i++) {
                    console.log(i)
                    removeDuplicatedPoints.splice(i, 0, {
                        x: removeDuplicatedPoints[i].x,
                        y: removeDuplicatedPoints[i].y - i
                    })
                }
            } else if (removeDuplicatedPoints[i - 1].y - removeDuplicatedPoints[i].y > 1) {
                for (let i = 1; i < removeDuplicatedPoints[i - 1].y - removeDuplicatedPoints[i].y; i++) {
                    console.log(i)
                    removeDuplicatedPoints.splice(i, 0, {
                        x: removeDuplicatedPoints[i].x,
                        y: removeDuplicatedPoints[i].y + i
                    })
                }
            }
        } 

        if (removeDuplicatedPoints[i].y == removeDuplicatedPoints[i - 1].y) {
            if (removeDuplicatedPoints[i].x - removeDuplicatedPoints[i - 1].x > 1) {
                for (let i = 1; i < removeDuplicatedPoints[i].x - removeDuplicatedPoints[i - 1].x; i++) {
                    removeDuplicatedPoints.splice(i, 0, {
                        x: removeDuplicatedPoints[i].x - i,
                        y: removeDuplicatedPoints[i].y
                    })
                }
            } else if (removeDuplicatedPoints[i - 1].x - removeDuplicatedPoints[i].x > 1) {
                for (let i = 1; i < removeDuplicatedPoints[i - 1].x - removeDuplicatedPoints[i].x; i++) {
                    removeDuplicatedPoints.splice(i, 0, {
                        x: removeDuplicatedPoints[i].x + i,
                        y: removeDuplicatedPoints[i].y
                    })
                }
            }
        } 
    }

    return removeDuplicatedPoints;
}

function submitGame() {
    this.stopTimer();

    html2canvas(document.getElementById('game-bound')).then(function(canvas) {
        // document.getElementById('result-image').innerHTML = "";
        // document.getElementById('result-image').append(canvas);
        // const image = canvas.toDataURL('image/png').replace('image/png', 'image/octet-stream')
        // const a = document.createElement('a')
        // a.setAttribute('download', 'my-image.png')
        // a.setAttribute('href', image)
        // a.click()
        // canvas.remove()
        fetch('https://api.imgur.com/3/image', { // Your POST endpoint
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({image: canvas.toDataURL('image/png')})
        }).then(
            response => response.json() // if the response is a JSON object
        ).then(
            success => console.log(success) // Handle the success response object
        ).catch(
            error => console.log(error) // Handle the error response object
        );
    });  
}