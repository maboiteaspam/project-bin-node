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
    --describe      Describe the program workflow, 
                    give it a [pattern] to get more details.


__Initialize a node project__

This will initialize a new project on the current directory. 
`--layout` argument helps you to initialize a specific type of application.
You can mixin multiple layouts.

    project-node
    project-node -l lambda
    project-node --layout=grunt,bower
    project-node -l electron,lambda


__Specify a path__

    project-node -p the/path/to/init
    project-node --path=the/path/to/init


__Just try out__

The task, by default, will try to git init/add/commit/push to github.
You can control that behavior via those switches.

    project-node --novcs
    project-node --nocommit
    project-node --nopush


__Helps ect__

Useful things. Enjoy the Markdown syntax support within your command line.

    showusage project-bin-node
    
    project-node -h
    project-node -v
    project-node --verbose
    project-node --debug


## Initialization descriptions

This section describes the process implemented to reach a module setup.

Which actions are run, which files are created, which binary are invoked.

You can always get those information using `--describe` switch.

```sh
project-node -l grunt,bower --describe
project-node -l grunt,bower --describe layout
project-node -l grunt,bower --describe vcs_add
```

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

Describe resulting files layout after `project-node-init` has run.

Obviously, it will be impacted by your configuration.

##### Common layout

This is created whatever the chosen layout.

- README.md
- package.json
- .gitignore
- linter.rc
- ci.config

##### lambda layout

Layout for a lambda node package such library specifics.

- index.js

##### electron layout

Layout for an electron app. 
Prepares for you a backend / frontend kick starters.
You should probably invoke bower with it.

- app.js, an electron app kick-starter.
- bin.js, an electron bin kick-starter.
- /static/, an electron front app kick-starter.

##### grunt layout

Layout for a Grunt module.

- Gruntfile.js

##### bower layout

Layout for a module using bower.

- bower.json
- .bowerrc

## Configuration and modularity

This section describes the configuration mechanism available within this program.

### Grunt config
##### Per project
##### Per user
##### mixin

### Tasks workflow
##### Per project
##### Per user
##### mixin

More to explain. 
Maybe this will be up to date by the time you got there https://github.com/maboiteaspam/grunt2bin


## Todo

0. enjoy the module
1. rewrite the README
2. rewrite the tests
3. make more tests
4. think about per system user configuration
5. think about workflow editor
5. split tasks and TaskHelper into sub modules


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
