import pandas as pd
import numpy as np

d = pd.read_csv('./result.csv')

nodes = []
for i in range(0, d.index._stop):

    event = d.Event[i]
    node = d.Node[i]
    print d.Time[i]
    if(event != 'Add'):
      if(not nodes.__contains__(node)):
        print 'FAIL'
        print node
        break
    else:
      nodes.append(node)

print 'PASS'