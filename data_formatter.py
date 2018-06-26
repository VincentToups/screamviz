import pandas as pd
import numpy as np

# prints all properties on an object
def methods(obj):
  for property, value in vars(obj).iteritems():
    print property, ": ", value

def generateAddEvent(dataframe, node, time):
  return dataframe.append({'Node':node, 'Event':'Add', 'Target': np.NAN, 'Time':time}, ignore_index=True)

def generateConnectEvent(dataframe, node, target, time):
  return dataframe.append({'Node':node, 'Event':'Connect', 'Target': str(target), 'Time':time}, ignore_index=True)

def generateCommunityEvent(dataframe, node, target, time):
  return dataframe.append({'Node':node, 'Event':'Community', 'Target': target, 'Time':time}, ignore_index=True)

# Read from CSV
d = pd.read_csv('./doc/sample_scream_output.csv')
# Trim white space in column names.  Not optimized
for i in range(d.columns.size):
  d = d.rename(columns={d.columns[i]: d.columns[i].strip()})

# Initialize Resultant DataFrame with first two nodes
result = pd.DataFrame({'Node':[1, d.vertexB[0]], 'Event':['Add', 'Add'], 'Target': [np.NAN, np.NAN], 'Time': [0, d.timestamp[0]] })

for i in range(0, d.index._stop):
  prev = max(i-1,0)
  _nodeA = d.vertexA[i]
  _nodeB = d.vertexB[i]
  _timestamp= d.timestamp[i]
  _communityOldA = d.vertexAOldCommunity[i].strip()
  _communityOldB = d.vertexBOldCommunity[i].strip()
  _communityNewA = d.vertexANewCommunity[i]
  _communityNewB = d.vertexBNewCommunity[i]
  if(d.graphOrder[i]- d.graphOrder[prev] > 0):
    result = generateAddEvent(result, node=_nodeB, time=_timestamp)
  if(d.graphOrder[i] - d.graphOrder[prev] > 1):
    result = generateAddEvent(result, node=_nodeA, time=_timestamp)
  if(_communityOldA == '-1'):
    result = generateCommunityEvent(result, node=_nodeA, target=_communityNewA, time=_timestamp)
  if(_communityOldB == '-1'):
    result = generateCommunityEvent(result, node=_nodeB, target=_communityNewB, time=_timestamp)
  result = generateConnectEvent(result, node=_nodeA, target=_nodeB, time=_timestamp)

result.to_csv('result.csv')
