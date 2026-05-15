# Web_lab_3

#DeepSeek 

Время работы : 10 часов 

##Запуск через открытие index.html на сервере.

#Созданы основные классы и функции коллизий.

platformer-game/
├── index.html          # Главный HTML файл

├── css/

│   └── style.css       # Стили игры

├── js/
│   ├── main.js         # Точка входа, инициализация игры

│   ├── game.js         # Класс Game - основной игровой цикл

│   ├── player.js       # Класс Player - управление игроком

│   ├── platform.js     # Класс Platform - платформы

│   ├── enemy.js        # Класс Enemy - враги

│   ├── coin.js         # Класс Coin - монеты

│   ├── spike.js        # Класс Spike - шипы

│   ├── portal.js       # Класс Portal - портал

│   ├── input.js        # Класс Input - обработка ввода

│   ├── camera.js       # Класс Camera - камера

│   ├── collision.js    # Функции коллизий

│   └── utils.js        # Вспомогательные функции

└── assets/             # Папка для изображений 



#Назначение каждого файла

index.html	Главный HTML-документ, подключает все стили и скрипты, содержит структуру интерфейса

css/style.css	Стилизация игры: позиционирование элементов, анимации, оформление панелей и экранов

js/main.js	Точка входа, инициализирует игровой цикл и обработчики кнопок

js/game.js	Основной класс Game, управляет игровым процессом, коллизиями, переходами между уровнями

js/player.js	Класс Player, отвечает за движение, прыжки, атаку, здоровье и отрисовку эльфа

js/platform.js	Классы Platform и PlatformFactory, создают платформы и уровни

js/enemy.js	Класс Enemy, управляет движением врагов, их здоровьем и отрисовкой

js/coin.js	Классы Coin и CoinFactory, генерируют монеты на платформах

js/spike.js	Класс Spike, отвечает за шипы и урон от них

js/portal.js	Класс Portal, создаёт портал перехода на следующий уровень

js/input.js	Класс Input, обрабатывает нажатия клавиш (поддержка русской и английской раскладки)

js/camera.js	Класс Camera, реализует следящую камеру за игроком

js/collision.js	Утилиты для проверки столкновений между объектами

js/utils.js	Вспомогательные функции: clamp, randomRange, distance и др.

<img width="1162" height="596" alt="скрин4" src="https://github.com/user-attachments/assets/9c62c0cf-f097-4409-9b7e-6fca6c217946" />
<img width="1231" height="793" alt="скрин1" src="https://github.com/user-attachments/assets/bc379250-ec07-4802-a30c-fe3d31a3e83b" />
<img width="1215" height="804" alt="скрин5" src="https://github.com/user-attachments/assets/a38f38bb-93ff-40dc-bd2b-33e15f7f089c" />
<img width="1298" height="817" alt="скрин3" src="https://github.com/user-attachments/assets/6f2f54ca-e203-445e-bd7a-10e0da2d6a75" />
<img width="1223" height="821" alt="скрин2" src="https://github.com/user-attachments/assets/2d9ea490-8a09-4443-a140-6d3c9f4b86ae" />
