# project-bin-node
bin helper to initialize a node project.

## Installation
Run the following commands to download and install the application:

```sh
$ npm project-bin-node blah -g
```

## Usage

```
    # Initialize a node project.
    project-bin-node
    
    project-node -p /some/path
    
    # Version
    project-node -v
    
    # Help
    project-node -h
```

## Configuration

On __Project Root__ directory or within your __User Home__ directory.

Or both to override some settings.

Create a new file ```.local.json``` and adjust this content.

```json
{
	"profileData":{
		"node":{
			"author":"maboiteaspam",
			"version":"0.0.1",
			"entry":"index.js",
			"repository":"https://github.com/<%=author%>/<%=projectName%>.git",
			"bugs":"https://github.com/<%=author%>/<%=projectName%>/issues",
			"homepage":"https://github.com/<%=author%>/<%=projectName%>#readme",
            "packages":"fs-extra pat-extra underscore commander",
            "devPackages":"should super-agent",
			"test":"mocha",
			"license":"WTF",
			"blah":true,
			"travis":{"versions":["0.12","0.11","0.10","0.6","0.8","iojs","iojs-v1.0.4"]}
		}
	}
}
```


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
