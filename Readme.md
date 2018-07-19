## News 

result.csv adheres to expected data format and is ready to visualize!  

- (6/25/18) result.csv has `Add` events calculated
- (6/26/18) result.csv has `Connect` events calculated
- (6/26/18) result.csv has `Community` events calculated
- (6/26/18) result.csv has `Role` events calculated

## Expected Data Format

| Node | Event | Target | Time |
|------|-------|--------|------|
| A | add | -- | 0|
| B | add | -- | 1|
| A | connect | B | 2 |
| A | community | 1 | 2 |
| B | community | 1 | 2 |
| C | add | -- | 3 |
| A | connect | C | 3 |
| A | community | 2 | 3 |
| C | community | 2 | 3 |
| A | role | Ambassador | 3 |

## Data Conversion Issues

Iterate through all 2048 rows
- Generate `Add` event if `graphOrder` increases
- Generate `Connect` event once per iteration. Connect `vertexA` to `vertexB`
- Generate `Community` event from checking if `vertexNewCommunity` and `vertexOldCommunity` has changed.
- Generate `Role` event from comparing `vertexARole` with that node's role.  The default role is `none`

## Questions
- What is `graphWeight` vs `graphOrder`
- need to figure out what `edge_leaf_AB` and `edge_leaf_BA` means
- Sometimes the graph weight increases by more than 1.  How can this happen if only one node is added during each time step?

## Running the Visualization

You'll need nodejs, browserify, beefy. 

```

<install node and npm>

npm install -g beefy browserify

```

Then we need to setup the local project

```

npm install 

```

Then

```

beefy main.js:bundle.js

```

This will start a server, probably at localhost:9966

Open that in your browser.

