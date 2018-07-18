import pandas as pd
import numpy as np

d = pd.read_csv('./result.csv')


print('All Events must be preceded by an Add event for its respective node')
nodes = []
success = True
for i in range(0, d.index._stop):

    event = d.Event[i]
    node = d.Node[i]
    target = d.Target[i]
    if(event != 'Add'):
      if(not nodes.__contains__(node)):
        print('FAIL in '.__add__(event))
        print('Timestamp: '.__add__(str(d.Time[i])))
        print('Node: '.__add__(str(node)))
        success = False
        break
      if(event == 'Connect'):
        target = np.int64(target)
        if(not nodes.__contains__(target)):
          print('FAIL in Connect')
          print type(target)
          print type(nodes[1])
          print target
          print nodes
          print('Timestamp: '.__add__(str(d.Time[i])))
          print('Node: '.__add__(str(node)))
          success = False
          break
    else:
      nodes.append(node)

if(success):
  print('PASS')