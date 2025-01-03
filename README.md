# cfkit

[![NPM Version](https://img.shields.io/npm/v/@jinxedbuffer/cfkit.svg?style=flat)](https://www.npmjs.com/package/@jinxedbuffer/cfkit)
![NPM Downloads](https://img.shields.io/npm/dw/%40jinxedbuffer%2Fcfkit)
[![GitHub Last Commit](https://img.shields.io/github/last-commit/jinxedbuffer/cfkit)](https://github.com/jinxedbuffer/cfkit)

cfkit is a CLI tool for competitive programming leveraging Codeforces API.

**Terminals tested on**: kitty, Konsole

## Table of Contents

- [Installation](#installation)
- [Upgrading](#upgrading)
- [Usage](#usage)
- [Uninstallation](#uninstallation)
- [Contributing](#contributing)
- [License](#license)

## Installation

Before proceeding to install, make sure you have **Node (v22.12.0+)** and **nvm (v0.40.1+)** installed. If they're not
installed, [install it from here](https://nodejs.org/en/download).

```shell
# Install cfkit globally
npm i -g @jinxedbuffer/cfkit

# Confirm installation
cf -v # Should print the version number
```

## Upgrading

To upgrade `cfkit` to the latest version, run:

```shell
cf upgrade
```

## Usage

Once installed, you can use the `cf` command in your terminal. Here's an overview of how to use the available commands:

### Help

To see the available commands, run:

```shell
cf -h
```

This will display a list of commands and their descriptions.

### Contests

Use the `contest` or `c` command to view available contests.

```shell
cf contest|c [options]
```

**Options**

|        Option         | Description                                              |
|:---------------------:|:---------------------------------------------------------|
|    `-i, --id <id>`    | Show details of a contest by its ID.                     |
| `-s, --search <name>` | Search for a contest by its name.                        |
|   `-u, --upcoming`    | Show upcoming contests.                                  |
|    `-a, --active`     | Show active contests.                                    |
| `-l, --limit <limit>` | Limit the number of contests to show (default is `100`). |
|      `-g, --gym`      | Show only gym contests.                                  |

**Example**

- Show details of a contest by ID:

```shell
cf contest -i 1780
```

- Show upcoming contests:

```shell
cf contest -u
```

- Search for a contest by name:

```shell
cf contest -s "round 993"
```

### Problems

Use the `problem` or `p` command to view problems from the problem set.

```shell
cf problem|p [options]
```

**Options**

|         Option          | Description                                             |
|:-----------------------:|:--------------------------------------------------------|
|    `-R, --randomize`    | Randomize the list of problems.                         |
|  `-s, --search <name>`  | Search for a problem by its name.                       |
|  `-c, --contest <id>`   | Show problems from a specific contest.                  |
|  `-l, --limit <limit>`  | Limit the number of problems to show (default is `15`). |
| `-r, --rating <rating>` | Set a rating filter.                                    |
|   `-t, --tags <tags>`   | Set tags filter (comma-separated tags).                 |

**Example**

- Show 10 problems with rating equal to 1500:

```shell
cf problem -r 1500 -l 10
```

- Search for problems by name:

```shell
cf problem -s "queen"
```

- Search for problems by tags:

```shell
cf problem -t "tree"
```

### Judge

Use the `judge` or `j` command to judge code against test cases.

**Note: Currently only C++ is supported.**

```shell
cf judge|j [options]
```

**Options:**

|        Option         |                    Description                    |
|:---------------------:|:-------------------------------------------------:|
| `-i, --input <file>`  |  Relative path to input file (default: `in.txt`)  |
| `-o, --output <file>` | Relative path to output file (default: `out.txt`) |
|  `-c, --code <file>`  | Relative path to code file (default: `main.cpp`). |

**Example**

```shell
cf judge
```

### Generate

Use the `generate` or `g` command to generate input, output, and code files.

```shell
cf generate|g
```

This will generate `in.txt`, `out.txt`, and `main.cpp` files in your **current working directory**.

### Blogs

Use the `blog` or `b` command to view blogs.

```shell
cf blog|b [options]
```

**Options:**

|        Option         | Description             |
|:---------------------:|:------------------------|
| `-u, --user <handle>` | Show blog posts by user |

**Example:**

- Show blogs of an user:

```shell
cf blog -u MikeMirzayanov
```

### Cache

To delete all stored cache, use the `flush` pr `f` command:

```shell
cf flush|f
```

This will clear the cache data from your system.

## Uninstallation

To uninstall `cfkit`, run this command:

```shell
npm uninstall -g @jinxedbuffer/cfkit
```

## Contributing

Contributions are welcome! If you'd like to contribute, please follow these steps:

1. Fork the repository.
2. Create a new branch (`git checkout -b feature/your-feature-name`).
3. Make your changes.
4. Commit your changes (`git commit -m "Add feature/bugfix"`).
5. Push your branch to your forked repository (`git push origin feature/your-feature-name`).
6. Open a pull request with a description of your changes.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.