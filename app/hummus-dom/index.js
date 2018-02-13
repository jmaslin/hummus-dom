import { toJS, fromJS, Map, List, merge, deepCopy } from 'immutable';

let currentTree = Map();

const setElementProp = function setElementProp(el, name, value) {
  if (name === 'className') { name = 'class' }; // class is a reserved word in javascript
  el.setAttribute(name, value);
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

  console.log('createElement', el);

  return el;
};

const addNode = function addNode(node) {
  const root = document.getElementById('root');
  console.debug('addNode: called')

  if (node.equals(currentTree)) {
    console.debug('No change detected.');
    return false;
  }

  // currentTree = currentTree.mergeDeep(node);

  root.appendChild(createElement(node));
  console.debug('addNode: child appended');
};

const isEqual = function isEqual(oldNode, newNode) {
  console.time('isEqual');
  if (Map.isMap(newNode) && Map.isMap(oldNode)) {
    console.debug(newNode.equals(oldNode))
    console.debug(oldNode.toJS(), newNode.toJS());
  }

  if (Map.isMap(newNode) && Map.isMap(oldNode) && (true === newNode.equals(oldNode))) {
    return true;
  } else if ('string' === typeof newNode && 'string' === typeof oldNode && newNode === oldNode) {
    return true;
  }
  console.timeEnd('isEqual');

  return false;
};

const updateNode = function updateNode(parent, newNode, oldNode, index = 0) {
  console.debug('updateNode: start index:', index);

  if (!oldNode) {
    console.debug('updateNode: no old node - append new node')
    parent.appendChild(createElement(newNode));
  } else if (!newNode) {
    console.debug('updateNode: no new node - remove child node')
    parent.removeChild(parent.childNodes[index]);
  } else if (true === isEqual(oldNode, newNode)) {
    console.debug('Tree is equal, do nothing.');
    return;
  } else if (Map.isMap(newNode) && Map.isMap(oldNode)) {
    if (newNode.get('type') !== oldNode.get('type')) {
      console.debug('Types are different, replace whole thing')
      parent.replaceChild(createElement(newNode), parent.childNodes[index]);

      return;
    } else if (false === newNode.get('props').equals(oldNode.get('props'))) {
      console.debug('Props are different, update them');

      const keysToDelete = oldNode
        .get('props')
        .keySeq()
        .toSet()
        .subtract(newNode.get('props').keySeq().toSet());

      const changedProps = newNode.get('props').filter((val, key) => {
        return val !== oldNode.get('props').get(key);
      });

      deleteProps(parent.childNodes[index], keysToDelete);
      setProps(parent.childNodes[index], changedProps);
    }

    const maxNumber = Math.max(newNode.get('children').size, oldNode.get('children').size);
    console.debug('updateNode: continue down - max num:', maxNumber)

    // Continue down the tree to update children nodes
    Array(maxNumber).fill().forEach((_, idx) => {
      updateNode(
        parent.childNodes[index],
        newNode.get('children').get(idx),
        oldNode.get('children').get(idx),
        idx
      );
    });
  } else {
    console.debug('Replace old with new (both strings or Map/string combo)');
    parent.replaceChild(createElement(newNode), parent.childNodes[index]);
  }
};

// Turn JSX syntax into plain objects
const chickpea = function chickpea(type, props, ...children) {
  if (!props) { props = {}; }
  return fromJS({ type, props, children });
};

export const Hummus = {
  addNode,
  updateNode,
  chickpea
};
