import pandas as pd
import numpy as np

# prints all properties on an object
def methods(obj):
  for property, value in vars(obj).iteritems():
    print property, ": ", value

def generateAddEvent(dataframe, node, time):
  return dataframe.append({'Node':node, 'Event':'Add', 'Target': np.NAN, 'Time':time}, ignore_index=True)

# Read from CSV
d = pd.read_csv('./doc/sample_scream_output.csv')
# Trim white space in column names.  Not optimized
for i in range(d.columns.size):
  d = d.rename(columns={d.columns[i]: d.columns[i].strip()})

# Initialize Resultant DataFrame with first two nodes
result = pd.DataFrame({'Node':[1, d.vertexB[0]], 'Event':['Add', 'Add'], 'Target': [np.NAN, np.NAN], 'Time': [0, d.timestamp[0]] })

for i in range(0, d.index._stop):
  prev = max(i-1,0)
  if(d.graphOrder[i]- d.graphOrder[prev] > 0):
    result = generateAddEvent(result, node=d.vertexB[i], time=d.timestamp[i])
  if(d.graphOrder[i] - d.graphOrder[prev] > 1):
    result = generateAddEvent(result, node=d.vertexA[i], time=d.timestamp[i])

result.to_csv('result.csv')
