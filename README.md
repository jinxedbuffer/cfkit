# cfkit

[![NPM Version](https://img.shields.io/npm/v/@jinxedbuffer/cfkit.svg?style=flat)](https://www.npmjs.com/package/@jinxedbuffer/cfkit)
![NPM Downloads](https://img.shields.io/npm/dw/%40jinxedbuffer%2Fcfkit)
[![GitHub Last Commit](https://img.shields.io/github/last-commit/jinxedbuffer/cfkit)](https://github.com/jinxedbuffer/cfkit)

cfkit is a CLI tool for competitive programming leveraging Codeforces API.

**Terminals tested on**: kitty, Konsole

```text
Usage: cf [command] [options]

  _____ ______ _  _______ _______
/ ____|  ____| | / /_   _|__   __|
| |    | |__  | ' /  | |    | |
| |    |  __| |  <   | |    | |
| |____| |    | . \ _| |_   | |
 \_____|_|    |_|\_\_____|  |_|

If you enjoy this software, give a star:
https://github.com/jinxedbuffer/cfkit

Options:
  -v, --version         Output the version number
  -h, --help            Display help for a command

Commands:
  contest|c [options]   Show available contests
  problem|p [options]   Show problems from problemset
  generate|g [options]  Generate files (`in.txt`, `out.txt`, `main.cpp`)
  judge|j [options]     Judge code against testcases
  blog|b [options]      Show blog posts
  upgrade|u             Upgrade cfkit
  flush|f               Deletes all stored cache
```

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

```text
$ cf contest -i 1780
┌──────────────────────────────────────────────────────────┐
│                      Contest # 1780                      │
├─────────────────┬────────────────────────────────────────┤
│ Name            │ Codeforces Round 846 (Div. 2)          │
├─────────────────┼────────────────────────────────────────┤
│ Phase           │ FINISHED                               │
├─────────────────┼────────────────────────────────────────┤
│ Frozen          │ No                                     │
├─────────────────┼────────────────────────────────────────┤
│ Duration        │ 2 hours                                │
├─────────────────┼────────────────────────────────────────┤
│ Start Time      │ 25 Jan 2023 | 08:05 PM (2 years ago)   │
├─────────────────┼────────────────────────────────────────┤
│ Link            │ https://codeforces.com/contest/1780    │
└─────────────────┴────────────────────────────────────────┘
? Choose an option (Use arrow keys)
❯ Open in browser
  Generate files for this contest
  See problems
  Back
  Exit
```

- Show upcoming contests:

```text
$ cf contest -u
? Select a contest (Use arrow keys)
❯ # 2056 │ in 13 days │ Codeforces Round (Div. 2)
  # 2055 │ in 8 days  │ Codeforces Round (Div. 2)
  # 2057 │ in 3 hours │ Hello 2025
```

- Search for a contest by name:

```text
$ cf contest -s "round 993"
? Select a contest (Use arrow keys)
❯ # 2044 │ 20 days ago │ Codeforces Round 993 (Div. 4)
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

```text
$ cf problem -r 1500 -l 10
?  Select a problem
❯ # 2050E  │ Three Strings                           │ dp, implementation, strings
  # 2049C  │ MEX Cycle                               │ brute force, constructive algorithms, greedy, implementation
  # 2027C  │ Add Zeros                               │ brute force, data structures, dfs and similar, dp, graphs, greedy
  # 2026C  │ Action Figures                          │ binary search, brute force, constructive algorithms, data structures,
  # 2008E  │ Alternating String                      │ brute force, data structures, dp, greedy, implementation, strings
  # 2007C  │ Dora and C++                            │ math, number theory
  # 2003D1 │ Turtle and a MEX Problem (Easy Version) │ greedy, math
(Use arrow keys to reveal more choices)
```

- Search for problems by name:

```text
$ cf problem -s "queen"
?  Select a problem (Use arrow keys)
❯ # 1667C │ Half Queen Cover                            │ constructive algorithms, math
  # 1143C │ Queen                                       │ dfs and similar, trees
  # 685E  │ Travelling Through the Snow Queen's Kingdom │ bitmasks, brute force, divide and conquer, graphs
  # 587E  │ Duff as a Queen                             │ data structures
  # 131E  │ Yet Another Task with Queens                │ sortings
```

- Search for problems by tags:

```text
$ cf problem -t "tree"
❯ # 2053E  │ Resourceful Caterpillar Sequence    │ dfs and similar, dp, games, graphs, greedy, trees
  # 2052M  │ Managing Cluster                    │ dp, graphs, math, trees
  # 2050G  │ Tree Destruction                    │ dfs and similar, dp, trees
  # 2048F  │ Kevin and Math Class                │ brute force, data structures, divide and conquer, dp, implementation, math
  # 2044G2 │ Medium Demon Problem (hard version) │ dfs and similar, dp, dsu, graphs, implementation, trees
  # 2044G1 │ Medium Demon Problem (easy version) │ dfs and similar, graph matchings, graphs, implementation, trees
  # 2042E  │ Vertex Pairs                        │ binary search, brute force, data structures, dfs and similar, divide and c
(Use arrow keys to reveal more choices)
```

### Generate

Use the `generate` or `g` command to generate input, output, and code files.

```shell
cf generate|g [options]
```

This will generate `in.txt`, `out.txt`, and `main.cpp` files in your **current working directory**.

|        Option        | Description                                  |
|:--------------------:|:---------------------------------------------|
| `-c, --contest <id>` | Generates files for each problem in contest. |
| `-p, --problem <id>` | Generate files for a problem                 |

**Example**

- Generate files for problem ID `2047B`

```text
$ cf generate -p 2047B
✔ Successfully generated files for problem # 2047B
````

This will create files for problem ID `2047B` in a folder named `2047B` in the current working directory.

- Generate files for all problems of contest ID `2047`

```text
$ cf generate -c 2047
✔ Successfully generated files for problem # 2047A
✔ Successfully generated files for problem # 2047B
✔ Successfully generated files for problem # 2047C
✔ Successfully generated files for problem # 2047D
✔ Successfully generated files for problem # 2047E
✔ Successfully generated files for problem # 2047F
```

This will create folders and files for each problem in contest ID `2047` (e.g., `2047A`, `2047B`, ...) in the current
working directory.

```text
./
├── 2047A/
│   ├── in.txt
│   ├── main.cpp
│   └── out.txt
├── 2047B/
│   ├── in.txt
│   ├── main.cpp
│   └── out.txt
├── 2047C/
│   ├── in.txt
│   ├── main.cpp
│   └── out.txt
.
.
```

**Notes:** If both options are omitted, only blank files will be created. Use `-p` or `-c` to parse testcases as well.

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

- Judge `main.cpp` against testcase files (`in.txt` and `out.txt`)

```text
$ cf judge
✔ Compilation successful
✔ Execution for testcase 1 successful (took 5.10 ms)
Testcase 1: [x] Failed
┌──────────┬─────┐
│ Expected │ Got │
├──────────┼─────┤
│ a        │ 1   │
│ b        │ 2   │
│ d        │ 3   │
└──────────┴─────┘
```

- **Note:** If no options are provided, make sure to keep all three files are in the same directory and `cf judge` is
  executed in the same folder.

### Blogs

Use the `blog` or `b` command to view blogs.

```shell
cf blog|b [options]
```

**Options:**

|              Option              | Description             |
|:--------------------------------:|:------------------------|
| `-u, --user <handle>` (required) | Show blog posts by user |

**Example:**

- Show blogs of an user:

```text
$ cf blog -u MikeMirzayanov
?  Choose a blog
❯ # 137946 │ 6 days ago   │ New Year's Eve Update: Random Problems for Mashups
  # 137533 │ 9 days ago   │ MaraTON Challenge 1
  # 137562 │ 14 days ago  │ Goodbye, 2024. Hello, 2025!
  # 134010 │ 4 months ago │ ICPC World Finals in Astana: I invite you to a push-up challenge!
  # 133941 │ 4 months ago │ Rule Restricting the Use of AI [revision 2024-09-14]
  # 133401 │ 4 months ago │ Congratulations: Tourist has reached a rating of 4000!
  # 133293 │ 4 months ago │ Testing Round 19 [unrated registration testing]
(Use arrow keys to reveal more choices)
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