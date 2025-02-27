# DV documentation

Страничка таймлайна в онлайн-документации. Главная фича - поиск в иерархическом дереве и фильтрация результатов.

### Технологии:

- React
- TypeScript
- Vite

### Ветки:

- main - В реальной документации используется эта ветка.

### Установка и использование

```
npm install
npm run dev
npm run build
```

### Разработка внутри страницы документации

Клонировать репозитории:

- Antora-playbook https://github.com/Docsvision/antora-playbook/tree/dev-quick-build
- Antora-ui https://github.com/Docsvision/antora-ui-default

Установить все пакеты.

Собрать UI бандл в репозитории Antora-ui согласно файлу readme.

Собрать документацию и поднять http-server в репозитории Antora-playbook согласно файлу readme.

В директории wwwroot в репозитории Antora-playbook на странице с текущим проектом (/timeline) открыть index.html файл. Заменить пути к файлам  `timeline.min.js` и `timeline.min.css` на локальные пути vite-сервера, `http://localhost:5173/vendor/patches.min.js` и `http://localhost:5173/vendor/patches.min.css`.

Перед скриптом получения js файла необходимо так же добавить скрипт с импортом библиотеки `@react-refresh`, без этого код работать не будет, возможно исправят в следующих версиях.

```
 <script type="module">
    import RefreshRuntime from "http://localhost:5173/@react-refresh"
    RefreshRuntime.injectIntoGlobalHook(window)
    window.$RefreshReg$ = () => {}
    window.$RefreshSig$ = () => (type) => type
    window.__vite_plugin_react_preamble_installed__ = true
  </script>
```


Если вы запускаете приложение не на стандартном 5173 порте, необходимо будет поменять его так же в настройках proxy файла `vite.config.ts`.