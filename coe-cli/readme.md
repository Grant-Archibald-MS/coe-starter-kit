# Overview

The Center of Excellence (COE) toolkit command line interface (CLI) provide common functionality to automate the installation and operate solutions within a COE environment.

## Prerequisites

To run the COE CLI application you will require the following

1. An installation of Node for versions (10, 12, 14, 16)

## Installation

### Via NPM

```bash
npm install -g @pp-coe/coe-cli
```

## Via Source Control

1. Download or clone repository

1. Change to unzipped or cloned repository

1. Install application dependencies

```
npm install
```

1. Build the application

```
npm run build
```

1. Link to the CLI application

```
npm link
```

## Getting Started

Once installed can use -h argument to se help options

```
coe -h
```

## Technical Details

The COE command line application makes use of following components

1. Node JS to provide cross platform support
1. TypeScript to leverage published type definitions for dependent components
1. Jest for unit tests. 

### Key NPM Scripts

1. Run unit tests

```
npm run test
```

1. Run development version

```
npm run start
```

1. Build production version

```
npm run prod
```

## Possible Roadmap

This command line interface is investigating the following areas for implementation

coe tooklkit
    install -type all
    install -type aad
    install -type environment

coe aa4am
    install -type all
    install -type aad
    install -type environment
    install -type devops

    branch

coe portal
    
