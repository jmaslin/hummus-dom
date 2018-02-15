import { toJS, fromJS, Map, List, merge, deepCopy } from 'immutable';

/* DOM HELPERS */

const setElementProp = function setElementProp(el, name, value) {
  if (name === 'className') { name = 'class' }; // class is a reserved word in javascript
  if (name === 'onClick') {
    // remove old if exists

    // register event listener
    el.addEventListener('click', value, true);
  } else {
    el.setAttribute(name, value);
  }
};

const removeElementProp = function removeElementProp(el, name) {
  el.removeAttribute(name);
}

const setProps = function setProps(el, propMap) {
  propMap.forEach((value, key) => setElementProp(el, key, value));
};

const deleteProps = function deleteProps(el, propsToDelete) {
  propsToDelete.forEach((value, key) => removeElementProp(el, value));
}

const createElement = function createElement(node) {
  if (typeof node === 'string') {
    return document.createTextNode(node);
  }
  const el = document.createElement(node.get('type'));
  setProps(el, node.get('props'));

  node.get('children')
    .map(createElement)
    .forEach(el.appendChild.bind(el));

  // console.debug('createElement', el);

  return el;
};

const addNode = function addNode(node) {
  const root = document.getElementById('root');
  console.debug('addNode: called')

  root.appendChild(createElement(node));
  console.debug('addNode: child appended');
};

const updateProps = function updateProps(oldNode, newNode, parent, index) {
  console.debug('Props are different, update them');

  const keysToDelete = oldNode
    .get('props')
    .keySeq()
    .toSet()
    .subtract(newNode.get('props').keySeq().toSet());

  const changedProps = newNode.get('props').filter((val, key) => {
    return val !== oldNode.get('props').get(key);
  });

  if (oldNode.getIn(['props', 'onClick'])) {
    parent.childNodes[index].removeEventListener('click', oldNode.getIn(['props', 'onClick']));
  }

  deleteProps(parent.childNodes[index], keysToDelete);
  setProps(parent.childNodes[index], changedProps);
};

/* IMMUTABLE HELPERS */

const bothMaps = function bothMaps(nodeOne, nodeTwo) {
  return Map.isMap(nodeOne) && Map.isMap(nodeTwo);
};

const childrenAreMaps = function childrenAreMaps(newNode, oldNode) {
  return Map.isMap(newNode.getIn(['children', 0])) &&
         Map.isMap(oldNode.getIn(['children', 0]));
};

const isEqual = function isEqual(oldNode, newNode) {
  if (Map.isMap(newNode) && Map.isMap(oldNode)) {
    console.debug('isEqual', oldNode.toJS(), newNode.toJS());
  } else {
    console.debug('isEqual', oldNode, newNode);
  }

  if (bothMaps(newNode, oldNode) && (true === newNode.equals(oldNode))) {
    return true;
  } else if ('string' === typeof newNode && 'string' === typeof oldNode && newNode === oldNode) {
    return true;
  }

  return false;
};

// TODO: check all children for consistency
const childrenHaveKeys = function childrenHaveKeys(node) {
  return undefined !== node.getIn(['children', 0, 'props', 'key']);
};

const childMapsAreDifferentSizes = function childMapsAreDifferentSizes(oldNode, newNode) {
  return oldNode.get('children').size !== newNode.get('children').size;
}

/* JSX HELPERS */

// Turn JSX syntax into plain objects
const chickpea = function chickpea(type, props, ...children) {
  if (!props) { props = {}; }
  return fromJS({ type, props, children });
};

const chickpeaTwo = function chickpea(type, props, children) {
  if (!props) { props = {}; }
  return fromJS({ type, props, children });
};

/* VIRTUAL LOGIC */

const updateNode = function updateNode(parent, newNode, oldNode, index = 0) {
  if (index === 0) {
    console.debug('--------------------------------')
  }
  console.debug('updateNode: start index:', index);
  console.debug(parent, newNode, oldNode);

  if (true === isEqual(oldNode, newNode)) {
    console.debug('updateNode: new/old is equal, do nothing');
    return;
  }

  if (!oldNode) {
    console.debug('updateNode: no old node - append new node')
    parent.appendChild(createElement(newNode));
  } else if (!newNode) {
    console.debug('updateNode: no new node - remove child node')
    parent.removeChild(parent.childNodes[index]);
  } else if (childrenAreMaps(oldNode, newNode) && childrenHaveKeys(oldNode) && childMapsAreDifferentSizes(oldNode, newNode)) {
    console.debug('updateNode: children are maps with keys and something has changed in list')
    const immediateParent = parent.childNodes[index];

    // find the index of DOMs with existing keys in oldNode
    const oldNodeReference = {};
    const newNodeReference = {};
    newNode.get('children').forEach((val, index) => {
      const domKey = val.getIn(['props', 'key']);
      if (undefined !== domKey) {
        newNodeReference[domKey] = index;
      }
    });
    oldNode.get('children').forEach((val, index) => {
      const domKey = val.getIn(['props', 'key']);
      if (undefined !== domKey) {
        oldNodeReference[domKey] = index;
      }
    });

    console.debug('KEY| ref map', oldNodeReference, newNodeReference);

    // if there is a removal, update indexes
    Object.keys(oldNodeReference).forEach((oldKey) => {
      if (false === oldKey in newNodeReference) {
        const indexOfRemoval = oldNodeReference[oldKey];
        const nodeToRemove = immediateParent.childNodes[indexOfRemoval];
        console.debug('KEY| Remove key/node', oldKey)
        Object.keys(oldNodeReference).forEach((oldKey) => {
          if (oldNodeReference[oldKey] > indexOfRemoval) {
            oldNodeReference[oldKey] = oldNodeReference[oldKey] - 1;
          }
        });
        immediateParent.removeChild(nodeToRemove);
      }
    });

    console.debug('KEY| ref map modified', oldNodeReference, newNodeReference);

    // reverse so nodes are not overwritten
    newNode.get('children').forEach((val, newIndex) => {
      const key = val.getIn(['props', 'key']);
      const oldIndex = oldNodeReference[key];

      if (false === key in oldNodeReference) {
        console.debug('KEY| New item', key);
        immediateParent.appendChild(createElement(val));
      } else if (newIndex !== oldIndex && immediateParent.childNodes[oldIndex]) {
        console.debug('KEY| New position', key, 'is', newIndex);
        immediateParent.replaceChild(createElement(val), immediateParent.childNodes[oldIndex]);
      } else {
        console.debug('KEY| Same position', key);
      }
    });
  } else if (bothMaps(oldNode, newNode)) {
    console.debug('updateNode: both maps');
    if (newNode.get('type') !== oldNode.get('type')) {
      console.debug('Types are different, replace whole thing')
      parent.replaceChild(createElement(newNode), parent.childNodes[index]);
      return;
    } else if (false === newNode.get('props').equals(oldNode.get('props'))) {
      updateProps(oldNode, newNode, parent, index);
    }

    const maxNumber = Math.max(newNode.get('children').size, oldNode.get('children').size);
    console.debug('updateNode: continue down - max num:', maxNumber)

    // Continue down the tree to update children nodes
    Array(maxNumber).fill().forEach((_, idx) => {
      console.debug('Continue down')
      updateNode(
        parent.childNodes[index],
        newNode.get('children').get(idx),
        oldNode.get('children').get(idx),
        idx
      );
    });

  } else {
    console.debug('Replace old with new (both strings or Map/string combo)');
    console.debug(createElement(newNode), parent.childNodes[index])
    parent.replaceChild(createElement(newNode), parent.childNodes[index]);
  }
};

export const Hummus = {
  addNode,
  updateNode,
  chickpea,
  chickpeaTwo
};
