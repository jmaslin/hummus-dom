import { fromJS, Map, List, merge, deepCopy } from 'immutable';

let currentTree = Map();

const createElement = function createElement(node) {
  if (typeof node === 'string') {
    return document.createTextNode(node);
  }
  const el = document.createElement(node.get('type'));

  node.get('children')
    .map(createElement)
    .forEach(el.appendChild.bind(el));

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

const isNotEqual = function isEqual(oldNode, newNode) {
  if (Map.isMap(newNode) && false === newNode.equals(oldNode)) {
    return true;
  } else if ('string' === typeof newNode && newNode !== oldNode) {
    return true;
  }

  return false;
};

const updateNode = function updateNode(parent, newNode, oldNode, index = 0) {
  console.debug('updateNode: start', index);
  if (!oldNode && !newNode) { return; }

  if (!oldNode) {
    console.debug('updateNode: no old node - append new node')
    parent.appendChild(createElement(newNode));
  } else if (!newNode) {
    console.debug('updateNode: no new node - remove child node')
    parent.removeChild(parent.childNodes[index]);
  } else if (isNotEqual(oldNode, newNode)) {
    console.debug('updateNode: replace old node with new node');
    parent.replaceChild(createElement(newNode), parent.childNodes[index]);
  } else if (Map.isMap(newNode)) {
    console.debug('updateNode: continue down')
    const maxNumber = Math.max(newNode.get('children').size, oldNode.get('children').size);
    console.debug('updateNode: maxNum', maxNumber)

    Array(maxNumber).fill().forEach((_, idx) => {
      updateNode(
        parent.childNodes[index],
        newNode.get('children').get(idx),
        oldNode.get('children').get(idx),
        idx
      );
    });

  } else {
    console.debug('updateNode: no change?');
  }
};

// Turn JSX syntax into plain objects
const chickpea = function chickpea(type, props, ...children) {
  return fromJS({ type, props, children });
};

export const Hummus = {
  addNode,
  updateNode,
  chickpea
};
