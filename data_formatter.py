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

def generateRoleEvent(dataframe, node, target, time):
  return dataframe.append({'Node':node, 'Event':'Role', 'Target': target, 'Time':time}, ignore_index=True)

# Read from CSV
d = pd.read_csv('./doc/sample_scream_output.csv')
# Trim white space in column names.  Not optimized
for i in range(d.columns.size):
  d = d.rename(columns={d.columns[i]: d.columns[i].strip()})

nodesCount = d.vertexA[d.index._stop - 1]
# Initialize Resultant DataFrame with first two nodes
result = pd.DataFrame({'Node':[1, d.vertexB[0]], 'Event':['Add', 'Add'], 'Target': [np.NAN, np.NAN], 'Time': [0, d.timestamp[0]] })

# Initialize Role Tracker
roles = [''] * (nodesCount + 1)
nodes = [1, d.vertexB[0]]
for i in range(0, d.index._stop):
  prev = max(i-1,0)
  _nodeA         = d.vertexA[i]
  _nodeB         = d.vertexB[i]
  _roleA         = d.vertexARole[i]
  _roleB         = d.vertexBRole[i]
  _timestamp     = d.timestamp[i]
  _communityOldA = d.vertexAOldCommunity[i].strip()
  _communityOldB = d.vertexBOldCommunity[i].strip()
  _communityNewA = d.vertexANewCommunity[i]
  _communityNewB = d.vertexBNewCommunity[i]
  if(d.graphOrder[i] - d.graphOrder[prev] > 1):
    result = generateAddEvent(result, node=_nodeA, time=_timestamp)
    result = generateAddEvent(result, node=_nodeB, time=_timestamp)
    nodes.append(_nodeA)
    nodes.append(_nodeB)
    # print('timestamp: '.__add__(str(_timestamp)).__add__(' NodeA: ').__add__(str(_nodeA)).__add__(' NodeB: ').__add__(str(_nodeB)))
  elif(d.graphOrder[i]- d.graphOrder[prev] > 0):
    if(nodes.__contains__(_nodeA)):
      result = generateAddEvent(result, node=_nodeB, time=_timestamp)
      nodes.append(_nodeB)
      # print('timestamp: '.__add__(str(_timestamp)).__add__(' NodeB: ').__add__(str(_nodeB)))
    else:
      result = generateAddEvent(result, node=_nodeA, time=_timestamp)
      nodes.append(_nodeA)
      # print('timestamp: '.__add__(str(_timestamp)).__add__(' NodeA: ').__add__(str(_nodeA)))
  if(_communityOldA == '-1'):
    result = generateCommunityEvent(result, node=_nodeA, target=_communityNewA, time=_timestamp)
  if(_communityOldB == '-1'):
    result = generateCommunityEvent(result, node=_nodeB, target=_communityNewB, time=_timestamp)
  if(_roleA != roles[_nodeA]):
    result = generateRoleEvent(result, node=_nodeA, target=_roleA, time=_timestamp)
  if(_roleB != roles[_nodeB]):
    result = generateRoleEvent(result, node=_nodeB, target=_roleB, time=_timestamp)
  result = generateConnectEvent(result, node=_nodeA, target=_nodeB, time=_timestamp)

  # Track Roles
  roles[_nodeA] = _roleA
  roles[_nodeB] = _roleB
result.
result.to_csv('result.csv')
