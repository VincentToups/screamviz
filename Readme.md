## News 

- (6/25/18) result.csv has `Add` events calculated

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
- Generate `Add` event if `graphWeight` increases
- Generate `Connect` once per iteration. Connect `vertexA` to `vertexB`
- Generate `Community` event from checking if `vertexNewCommunity` and `vertexOldCommunity` has changed.
- Generate `Role` event from comparing `vertexARole` with that node's role.  The default role is `none`

## Questions
- why does the graph start with `graphWeight` of 1?  Two nodes are introduced in first iteration ( 1, 22) respectively
- need to figure out what `edge_leaf_AB` and `edge_leaf_BA` means
- Sometimes the graph weight increases by more than 1.  How can this happen if only one node is added during each time step?