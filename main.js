//Глобальные переменные
var FIELD_SIZE_X = 20;
var FIELD_SIZE_Y = 20;
var SNAKE_SPEED = 400; //200мс
var WALL_TIMER = 10000; // Время через которое стена становится проходимой и наоборот
var NUMBER_SECRET= 3; // Коичество секретов
var snake = []; //Сама змейка
var snakeSpeed; //Скорость змейки
var stepSnakeSpeed=50; //Уровень изменения скорости
var direction = 'y+'; //Направление движения змейки
var oldDirection = 'y+'; //Старое направление движения змейки
var gameIsRunning = false; //Запущена ли игра
var snakeTimer; //Таймер змейки
var foodTimer; //Таймер еды
var score = 0; //Результат
var OBSTACLES_NUMBER=5; //Количество генерируемых препятствий
var obstaclesLength=8; //Макс. длина генерируемого препятствия
var stepObstacles=4; //Кол-во ходов, после которых появится стена
var obstaclesType='vertical'; //Ориентация припятствия
var obstacles=[]; //Инфомация о координатах стен
var wallOpen; // Таймер изминения границ
var flagLRWall=false; //Открыты или закрыты стены
var flagTBWall=false; //Открытие/закрытие верхней и нижней стены
var obstaclesNumber;
var numberSecret; //Число доступных секретов
var lengthSnakeForSecret=10; //Длина змейки до появления секрета
var flagCreateSecret=false; //Отсутствие на поле секрета

//Отвечает за количество ходов до окончания игры
var remainingMoves=FIELD_SIZE_X * FIELD_SIZE_Y - Math.floor(FIELD_SIZE_X * FIELD_SIZE_Y / 2);

//Генерация поля
prepareGameField();

var wrap = document.getElementsByClassName('wrap')[0];
//Подгоняем размер контейнера под игровое поле
if(16 * (FIELD_SIZE_X + 1) < 200){
    wrap.style.width = '200px';
} else {
    wrap.style.width = (16 * (FIELD_SIZE_X + 1)).toString() + 'px';
}

//Если нажата кнопка новая игра
document.getElementById('snake-new-game').addEventListener('click', startGame);
addEventListener('keydown', changeDirection);


//Создание таблицы
function prepareGameField() {
    //Создаем таблицу
    var gameTable = document.createElement('table');
    gameTable.classList.add('game-table');
    //Генерация ячеек для игровой таблицы
    for (var i = 0; i < FIELD_SIZE_Y; i++){
        var row = document.createElement('tr');
        row.classList.add('game-table-row');

        for (var j = 0; j < FIELD_SIZE_X; j++)
        {
            var cell = document.createElement('td');
            cell.classList.add('game-table-cell');
            cell.classList.add('cell-' + i + '-' + j);
            row.appendChild(cell);
        }
        gameTable.appendChild(row);
    }
    document.getElementById('snake-field').appendChild(gameTable);
}



//Старт игры
function startGame() {
    gameIsRunning = true;
    //Сброс предыдущей игры
    direction = 'y+';
    oldDirection = 'y+';
    obstaclesNumber=OBSTACLES_NUMBER;
    snakeSpeed=1;
    flagCreateSecret=false;
    numberSecret=NUMBER_SECRET;
    document.getElementsByClassName('speed_snake')[0].innerHTML=snakeSpeed;
    document.getElementsByClassName('time_wall')[0].innerHTML=obstaclesNumber;
    score = 0;
    clearObstacles();
    updateScoreTimeInfo();
    openLeftRightWall(false);
    openTopButtomWall(false);
    for (var i = 0; i < snake.length; i++) {
        snake[i].classList.remove('snake-unit');
    }
    snake = [];
    var units = document.getElementsByClassName('food-unit');
    for (i = 0; i < units.length; i++) {
        units[i].classList.remove('food-unit');
    }

    //Начало новой игры
    clearInterval(snakeTimer);
    clearInterval(foodTimer);
    respawn();
    snakeTimer = setInterval(move, (SNAKE_SPEED/snakeSpeed));
    foodTimer=setTimeout(createFood, 5000);
    wallOpen=setInterval(openAllWall,WALL_TIMER);
    document.getElementsByClassName('time_border')[0].innerHTML=(WALL_TIMER/1000)+' с.';

}

//Метод отвечает за расположение змейки в игровом поле
function respawn() {
    var startCoordsX = Math.floor(FIELD_SIZE_X / 2);
    var startCoordsY = Math.floor(FIELD_SIZE_Y / 2);
    //Голова змейки
    var snakeHead = document.getElementsByClassName('cell-' + startCoordsY + '-' + startCoordsX)[0];
    snakeHead.classList.add('snake-unit');
    snakeHead.setAttribute('data_y', startCoordsY.toString());
    snakeHead.setAttribute('data_x', startCoordsX.toString());
    //Тело змейки
    var snakeBody = document.getElementsByClassName('cell-' + (startCoordsY + 1) + '-' + startCoordsX)[0];
    snakeBody.classList.add('snake-unit');
    snake.push(snakeBody);
    snake.push(snakeHead);
}

//Движение змейки
function move() {
    var newUnit; //Новый элемент
    var coordY = parseInt(snake[snake.length - 1].getAttribute('data_y'));
    var coordX = parseInt(snake[snake.length - 1].getAttribute('data_x'));
    var oldPositionUnit=document.querySelector('.cell-'+(coordY)+'-'+(coordX));


    //Определяем новую точку
    switch (direction)
    {
        case 'x-': {
            newUnit = document.querySelector('.cell-' + (coordY) + '-' + (coordX -= 1));
            if (newUnit===null)
                if(oldPositionUnit.classList.contains('left-shadow')) {
                    newUnit = document.querySelector('.cell-' + (coordY) + '-' + (FIELD_SIZE_X - 1));
                    coordX=FIELD_SIZE_X-1;
                }
        }
            break;
        case 'x+': {
            newUnit = document.querySelector('.cell-' + (coordY) + '-' + (coordX += 1));
            if (newUnit===null)
                if(oldPositionUnit.classList.contains('right-shadow')) {
                    newUnit = document.querySelector('.cell-' + (coordY) + '-0');
                    coordX=0;
                }
        }
            break;
        case 'y-': {
            newUnit = document.querySelector('.cell-' + (coordY += 1) + '-' + (coordX));
            if (newUnit===null)
                if(oldPositionUnit.classList.contains('buttom-shadow')) {
                    newUnit = document.querySelector('.cell-0-' + (coordX));
                    coordY=0;
                }

        }
            break;
        case 'y+': {
            newUnit = document.querySelector('.cell-' + (coordY -= 1) + '-' + (coordX));
            if (newUnit===null)
                if(oldPositionUnit.classList.contains('top-shadow')) {
                    newUnit = document.querySelector('.cell-' + (FIELD_SIZE_Y - 1) + '-' + (coordX));
                    coordY=FIELD_SIZE_Y-1;
                }
        }
            break;
    }

    //Проверка. Не является ли новая часть частью змейки и не выходит ли за границы
    if(snake.indexOf(newUnit) === -1 && newUnit !== null && obstacles.indexOf(newUnit)===-1) {
        snake[snake.length - 1].removeAttribute('data_y');
        snake[snake.length - 1].removeAttribute('data_x');

        newUnit.classList.add('snake-unit');
        snake.push(newUnit);
        snake[snake.length - 1].setAttribute('data_y', coordY.toString());
        snake[snake.length - 1].setAttribute('data_x', coordX.toString());

        //Хвост. Проверка
        if (!haveFood(newUnit)) {

            //Уменьшаем хвост
            snake.splice(0, 1)[0].classList.remove('snake-unit');
        }
        if((snake.length-1)>=lengthSnakeForSecret && numberSecret!=0 && flagCreateSecret==false)createSecretUnit();

        // Проверка на секрет
        if(haveSecret(newUnit)){
            snake[0].classList.remove('snake-unit');
            snake[1].classList.remove('snake-unit');
            snake[2].classList.remove('snake-unit');
            snake[3].classList.remove('snake-unit');
            snake[4].classList.remove('snake-unit');
            snake.splice(0, 5); //Уменьшение змейки на 4-е единицы
            snakeSpeed+=3; //Увеичение скорости змейки в 3-и раза
            document.getElementsByClassName('speed_snake')[0].innerHTML=snakeSpeed;
            clearInterval(snakeTimer);
            snakeTimer = setInterval(move, (SNAKE_SPEED/snakeSpeed));
        }

    } else {
        //Заканчиваем игру
        finishGame();
    }
    oldDirection = direction;
}

//Создание еды
function createFood() {
    var foodCreated = false;
    while (!foodCreated)
    {
        var foodX = Math.floor(Math.random() * FIELD_SIZE_X);
        var foodY = Math.floor(Math.random() * FIELD_SIZE_Y);

        //Проверка на змейку
        var foodCell = document.querySelector('.cell-' + foodY + '-' + foodX);
        if(!foodCell.classList.contains('snake-unit') && !foodCell.classList.contains('food-unit')&&
        !foodCell.classList.contains('obstacles-unit')&&!foodCell.classList.contains('secret-unit')){
            foodCell.classList.add('food-unit');
            foodCreated = true;
        }
    }
}

//Создание секрета
function createSecretUnit() {
    var secretCreated = false;
    numberSecret--;
    flagCreateSecret=true;
    while (!secretCreated)
    {
        var secretX = Math.floor(Math.random() * FIELD_SIZE_X);
        var secretY = Math.floor(Math.random() * FIELD_SIZE_Y);


        var secretCell = document.querySelector('.cell-' + secretY + '-' + secretX);
        if(!secretCell.classList.contains('snake-unit') && !secretCell.classList.contains('food-unit')&&
            !secretCell.classList.contains('obstacles-unit')&&!secretCell.classList.contains('secret-unit')){
            secretCell.classList.add('secret-unit');
            secretCreated = true;
        }
    }
}

//Проверка на секрет
function haveSecret(unit) {
    if(unit.classList.contains('secret-unit')){
        unit.classList.remove('secret-unit');
        score++;
        if(score%stepSnakeSpeed==0)snakeSpeed++;
        document.getElementsByClassName('speed_snake')[0].innerHTML=snakeSpeed;
        if (score%stepObstacles==0){
            obstaclesNumber--;
            if(obstaclesNumber>=0)
                document.getElementsByClassName('time_wall')[0].innerHTML=obstaclesNumber;

            if(obstaclesNumber>=0)createObstacles();
        }
        updateScoreTimeInfo();
        flagCreateSecret=false;
        return true;
    }
    return false;
}

//Проверка на еду
function haveFood(unit) {
    if(unit.classList.contains('food-unit')){
        unit.classList.remove('food-unit');
        createFood();
        score++;
        if(score%stepSnakeSpeed==0) {
            snakeSpeed++;
            document.getElementsByClassName('speed_snake')[0].innerHTML = snakeSpeed;
            clearInterval(snakeTimer);
            snakeTimer = setInterval(move, (SNAKE_SPEED/snakeSpeed));
        }
        if (score%stepObstacles==0){
            obstaclesNumber--;
            if(obstaclesNumber>=0)
                document.getElementsByClassName('time_wall')[0].innerHTML=obstaclesNumber;

            if(obstaclesNumber>=0)createObstacles();
        }
        updateScoreTimeInfo();
        return true;
    }
    return false;
}

//Очистка поля от стен
function clearObstacles() {
    for(var i=0; i<obstacles.length;i++){
        obstacles[i].classList.remove('obstacles-unit');
    }
    obstacles=[];
}

//Формирование стен
function createObstacles() {
    var obstaclesCreate = false;
    var flag=true; //Построение стены от точки вверх или вправо
    var emergencyExit=0; //Запасной выход из цыкла построения стены


    while (!obstaclesCreate)
    {
        flag=true;
        var j=1; //Нужна для отстройки стены с другой стороны
        var obstaclesX = Math.floor(Math.random() * (FIELD_SIZE_X));
        var obstaclesY = Math.floor(Math.random() * (FIELD_SIZE_Y));
        //Проверка на змейку
        var obstaclesCell = document.querySelector('.cell-' + obstaclesY + '-' + obstaclesX);

        if (!obstaclesCell.classList.contains('snake-unit') && !obstaclesCell.classList.contains('obstacles-unit')&&
            !obstaclesCell.classList.contains('secret-unit')) {
            obstaclesCell.classList.add('obstacles-unit');
            obstacles.push(obstaclesCell);

            for(var i=1;i<obstaclesLength;i++){
                //Определение вертикального или горизонтального типа линии
                if (obstaclesType=='vertical'){

                    if(flag==true) {
                        obstaclesCell = document.querySelector('.cell-' + (obstaclesY - i) + '-' + obstaclesX);
                        //Проверку можно вынести в отдельную функцию
                        if (!obstaclesCell.classList.contains('snake-unit') && !obstaclesCell.classList.contains('obstacles-unit') &&
                            obstaclesCell.classList.contains('game-table-cell')&&obstaclesCell!==null) {
                            obstaclesCell.classList.add('obstacles-unit');
                            obstacles.push(obstaclesCell);
                        }
                        else {
                            flag=false;
                            i--;
                        }
                    }
                    else{
                        obstaclesCell=document.querySelector('.cell-'+(obstaclesY+j)+'-'+obstaclesX);
                        if (!obstaclesCell.classList.contains('snake-unit') && !obstaclesCell.classList.contains('obstacles-unit') &&
                            obstaclesCell.classList.contains('game-table-cell')&&obstaclesCell!==null) {
                            obstaclesCell.classList.add('obstacles-unit');
                            obstacles.push(obstaclesCell);
                            j++;
                        }
                        else {
                            flag=true;
                            i--;
                        }
                    }
                }
                else if(obstaclesType=='horizontal'){
                    if(flag==true) {
                        obstaclesCell = document.querySelector('.cell-' + (obstaclesY) + '-' + (obstaclesX + i));
                        if (!obstaclesCell.classList.contains('snake-unit') && !obstaclesCell.classList.contains('obstacles-unit') &&
                            obstaclesCell.classList.contains('game-table-cell')&&obstaclesCell!==null) {
                            obstaclesCell.classList.add('obstacles-unit');
                            obstacles.push(obstaclesCell);
                        }
                        else {
                            flag = false;
                            i--;
                        }
                    }
                    else {
                        obstaclesCell=document.querySelector('.cell-'+(obstaclesY)+'-'+(obstaclesX-j));
                        if (!obstaclesCell.classList.contains('snake-unit') && !obstaclesCell.classList.contains('obstacles-unit') &&
                            obstaclesCell.classList.contains('game-table-cell')&&obstaclesCell!==null) {
                            obstaclesCell.classList.add('obstacles-unit');
                            obstacles.push(obstaclesCell);
                            j++;
                        }
                        else {
                            flag=true;
                            i--;
                        }
                    }
                }

                emergencyExit++; // Счетчик аварийного выхода
                if(emergencyExit>=obstaclesLength+1)break; //Выход из цикла, на случай подвисания
            }

            //Смена ориентации новой стены
            if(obstaclesType=='vertical')obstaclesType='horizontal';
            else obstaclesType='vertical';
            obstaclesCreate = true;
        }

    }
}

//Отвечает за открытие левой и правой стены
function openLeftRightWall(flag) {
    var wallLeftOpen; //Обращение к левой стене
    var wallRightOpen; //Обращнеи к правой стене
    var i;
    if(flag){
        for(i=0;i<FIELD_SIZE_Y;i++) {
            //Создание тени для левой стены
            wallLeftOpen = document.querySelector('.cell-' +i+'-0');
            wallLeftOpen.classList.add('left-shadow');

            //Создание тения для правой стены
            wallRightOpen=document.querySelector('.cell-'+i+'-'+(FIELD_SIZE_X-1));
            wallRightOpen.classList.add('right-shadow');
        }
    }
    else {
        for(i=0;i<FIELD_SIZE_Y;i++) {
            //Создание тени для левой стены
            wallLeftOpen = document.querySelector('.cell-' +i+'-0');
            wallLeftOpen.classList.remove('left-shadow');

            //Создание тения для правой стены
            wallRightOpen=document.querySelector('.cell-'+i+'-'+(FIELD_SIZE_X-1));
            wallRightOpen.classList.remove('right-shadow');
        }
    }
}

//Отвечает за открытия верхней и нижней части
function openTopButtomWall(flag) {
    var wallTopOpen; //Обращение к левой стене
    var wallButtomOpen; //Обращнеи к правой стене
    var i;
    if(flag){
        for(i=0;i<FIELD_SIZE_X;i++) {
            //Создание тени для верхней части
            wallTopOpen = document.querySelector('.cell-0-'+(i));
            wallTopOpen.classList.add('top-shadow');

            //Создание тения для нижней части
            wallButtomOpen=document.querySelector('.cell-'+(FIELD_SIZE_Y-1)+'-'+(i));
            wallButtomOpen.classList.add('buttom-shadow');
        }
    }
    else {
        for(i=0;i<FIELD_SIZE_Y;i++) {
            //Убрать тень верхней части
            wallTopOpen = document.querySelector('.cell-0-'+(i));
            wallTopOpen.classList.remove('top-shadow');

            //Убрать тень нижней части
            wallButtomOpen=document.querySelector('.cell-'+(FIELD_SIZE_Y-1)+'-'+(i));
            wallButtomOpen.classList.remove('buttom-shadow');
        }
    }
}

// Отвечает за открытие всех стен
function openAllWall() {
    var indexOpenWall; //Определяет с какой парой стен произвести действие открытия/закрытия

    indexOpenWall=Math.floor(Math.random()*3); //Генерация числа для определения направления действий
    switch (indexOpenWall){
        //Действие для левой и правой стены
        case 0:{
            if(flagLRWall==false)flagLRWall=true;
            else flagLRWall=false;
            openLeftRightWall(flagLRWall);
        }
            break;

        //Действие для верхней и нижней стены
        case 1:{
            if (flagTBWall==false)flagTBWall=true;
            else flagTBWall=false;
            openTopButtomWall(flagTBWall);
        }
            break;

        //Действие связанное с четырмя направлениями
        case 2:{
            if(flagLRWall==false)flagLRWall=true;
            else flagLRWall=false;
            openLeftRightWall(flagLRWall);
            if (flagTBWall==false)flagTBWall=true;
            else flagTBWall=false;
            openTopButtomWall(flagTBWall);
        }
            break;
    }


}






//Обновление информации о текущем счете и оставшимся количестве ходов
function updateScoreTimeInfo() {
    document.getElementsByClassName('finish_game')[0].innerHTML=remainingMoves-score;
    document.getElementsByClassName('score_game')[0].innerHTML=score;
}

//Завершение игры
function finishGame() {
    gameIsRunning = false;
    //Остановка таймеров змейки и еды
    clearInterval(snakeTimer);
    clearInterval(foodTimer);
    clearInterval(wallOpen);
    //Чтобы победить, необходимо заполнить змейкой половину клеток
    if(score < remainingMoves){
        alert('Игра окончена!\nВаш результат ' + score.toString());
    } else {
        alert('Поздравляем! Вы победили!\nВаш результат ' + score.toString())
    }
}

function changeDirection(event) {
    switch (event.keyCode)
    {
        case 37: //Клавиша влево
            if(oldDirection !== 'x+'){
            direction = 'x-'
            }
            break;
        case 38: //Клавиша вверх
            if(oldDirection !== 'y-'){
            direction = 'y+';
            }
            break;
        case 39: //Клавиша вправо
            if(oldDirection !== 'x-'){
                direction = 'x+';
            }
            break;
        case 40: //Клавиша вниз
            if(oldDirection !== 'y+'){
                direction = 'y-';
            }
            break;
    }
}