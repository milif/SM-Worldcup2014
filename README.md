# Setup and building

This document describes how to set up your development environment to build app, and
explains the basic mechanics of using `git`, `node`, `npm`, `grunt`, and `bower`.

1. [Installing Dependencies](#H1_1)
2. [Forking on Github](#H1_2)
3. [Building app](#H1_3)
4. [Команды менеджера задач](#H1_4)

<a name="H1_1"></a>
## Installing Dependencies

Before you can build, you must install and configure the following dependencies on your
machine:

* [Git](http://git-scm.com/): The [Github Guide to
Installing Git](http://help.github.com/mac-git-installation) is a good source of information.

* [Node.js](http://nodejs.org): We use Node (version 0.10 or higher) to generate the documentation, run tests, and generate distributable files. Depending on your system, you can install Node either from source or as a
pre-packaged bundle.

* [Java](http://www.java.com): We minify JavaScript using our
[Closure Tools](https://developers.google.com/closure/) jar. Make sure you have Java (version 6 or higher) installed
and included in your [PATH](http://docs.oracle.com/javase/tutorial/essential/environment/paths.html) variable.

* [Grunt](http://gruntjs.com): We use Grunt as our build system. Install the grunt command-line tool globally with:

  ```shell
  npm install -g grunt-cli
  ```

* [Bower](http://bower.io/): We use Bower to manage client-side packages for the docs. Install the `bower` command-line tool globally with:

  ```shell
  npm install -g bower
  ```
  
- Если для локального запуска приложения используется Apache, проверьте, что активен модуль **mod_headers**. Если же используется другой веб-сервер, настройте его на выдачу заголовка **Access-Control-Allow-Origin "\*"** для папки `build/docs/partials`, иначе не возможна подгрузка шаблонов при запуске примеров в Plunker.

<a name="H1_2"></a>
## Forking on Github

To create a Github account, follow the instructions [here](https://github.com/signup/free).
Afterwards, go ahead and [fork](http://help.github.com/forking) the [main repository](<main repository>).

<a name="H1_3"></a>
## Building app

To build, you clone the source code repository and use Grunt to generate the non-minified and
minified files:

```shell
# Clone your Github repository:
git clone git@github.com:<github username>/<repository name>.git

# Go to the app directory:
cd <repository name>

# Add the main  repository as an upstream remote to your repository:
git remote add upstream <main repository>

# Install node.js dependencies:
npm install

# Build app:
grunt package
```

<div class="alert alert-warning">
**Note:** If you're using Windows, you must use an elevated command prompt (right click, run as
Administrator). This is because `grunt package` creates some symbolic links.
</div>

The build output can be located under the `build` directory.

<a name="H1_4"></a>
## Команды менеджера задач

Полная установка приложения и сайта документации:

    `grunt package`

Повторная инициализация приложения (без установки bower-компонент и сборки):

    `grunt init`

Пересборка сайта документации:

    `grunt docs`

Пересборка приложения:

    `grunt app`
   

