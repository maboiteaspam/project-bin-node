# project-bin-node
bin helper to initialize a node project.

Built on top of `grunt`, __configurable__, __modular__.


## Installation
Run the following commands to download and install the application:

```sh
$ npm i project-bin-node -g
```

In best effort possible, this module should be compatible windows.

## Usage

__project-node__ [options]

Initialize a project about node, github, travis, appveyor, linters, npm and so on.

    -l|--layout     lambda,grunt,bower,electron
                    The layouts to be used for module files templates.
    -p|--path       Path to the directory to initialize.
    -b|--bin        A binary to add to the module.
    --nocommmit     Do not commit the new repo.
    --nopush        Do not push the new repo.
    --novcs         Do not use any vcs at all.
    
    -v|--version    Version
    --verbose       More verbose
    --debug         Much more verbose


__Initialize a node project__

    project-node
    project-node -l lambda
    project-node --layout=grunt,bower
    project-node -l electron,lambda


__Specify a path__

    project-node -p the/path/to/init
    project-node --path=the/path/to/init


__Just try out__

    project-node --novcs
    project-node --nocommit
    project-node --nopush


__Helps ect__

    showusage project-bin-node
    
    project-node -h
    project-node -v
    project-node --verbose
    project-node --debug


## Initialization descriptions

This section describes the process implemented to reach a module setup.

### General setup

- __proper_config__ 
    At first, it ensure the grunt configuration holds some values for `author` and `repository` entries.
    Then, check `git` system configuration in order to ensure a global `excludefiles` is set. 
    Configures it to something like `$HOME/.gitignore` if it is not done yet.
    finally ensure the global gitinore file contains some values like `.idea`.
- __describe__
    Aims to gather information about the module such the `description` and the `keywords`.
    Module name is always guessed from the directory name of the `cwd`.
- __pkg_init__
    Creates `package.json`, `README.md` and `.gitignore` files given their templates.
- __deps_configure__
    Re-configures `package.json` to add a set of pre defined `dependencies` and `dev-dependencies`.
- __bin_setup__
    Only when `-b|--bin` option is provided. 
    Re-configures the `package.json` file and create new bin files structure given their template.
- __layout_make__
    Only when `-l|--layout` option is provided. 
    Re-configures the `package.json` file and create new bin files structure given their template.
- __linter__
    Given `global.linter` option in `grunt` config, re-configures `package.json` 
    and initialize a default linter configuration given a template.
- __ci__
    Given `global.ci` option in `grunt` config, re-configures `package.json` 
    and initialize a default `ci` configuration given a template.
- __cleanup__
    Clean up to re format `json` files.
- __vcs__
    Given `global.git` option in `grunt` config,
    initialize a new repository and proceeds steps to put it online (add, commit, push).


### Expected files layout

##### lambda layout
- README.md
- package.json
- .gitignore
- linter.rc
- ci.config
- index.js

##### electron layout
- README.md
- package.json
- .gitignore
- .bowerrc
- linter.rc
- ci.config
- app.js, an electron app kick-starter.
- bin.js, an electron bin kick-starter.
- /static/, an electron front app kick-starter.

##### grunt layout
- README.md
- package.json
- .gitignore
- linter.rc
- ci.config
- Gruntfile.js

##### bower layout
- README.md
- package.json
- .gitignore
- linter.rc
- ci.config
- bower.json
- .bowerrc

## Configuration

More to explain. Maybe this will be up to date by the time you got there https://github.com/maboiteaspam/grunt2bin


## Todo

0. enjoy the module
1. rewrite the README
2. rewrite the tests
3. make more tests
4. think about per system user configuration
5. think about workflow editor


## How to contribute

1. File an issue in the repository, using the bug tracker, describing the
   contribution you'd like to make. This will help us to get you started on the
   right foot.
2. Fork the project in your account and create a new branch:
   `your-great-feature`.
3. Commit your changes in that branch.
4. Open a pull request, and reference the initial issue in the pull request
   message.

## License
See the [LICENSE](./LICENSE) file.
