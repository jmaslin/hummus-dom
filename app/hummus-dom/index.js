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

  console.log('createElement', el);

  return el;
};

const addNode = function addNode(node) {
  const root = document.getElementById('root');
  console.debug('addNode: called')

  root.appendChild(createElement(node));
  console.debug('addNode: child appended');
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
  console.debug('updateNode: start index:', index);

  if (true === isEqual(oldNode, newNode)) {
    console.debug('Tree is equal, do nothing.');
    return;
  }

  if (!oldNode) {
    console.debug('updateNode: no old node - append new node')
    parent.appendChild(createElement(newNode));
  } else if (!newNode) {
    console.debug('updateNode: no new node - remove child node')
    parent.removeChild(parent.childNodes[index]);
  } else if (bothMaps(oldNode, newNode)) {
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

      if (oldNode.getIn(['props', 'onClick'])) {
        parent.childNodes[index].removeEventListener('click', oldNode.getIn(['props', 'onClick']));
      }

      deleteProps(parent.childNodes[index], keysToDelete);
      setProps(parent.childNodes[index], changedProps);
    }

    const maxNumber = Math.max(newNode.get('children').size, oldNode.get('children').size);
    console.debug('updateNode: continue down - max num:', maxNumber)

    // if children are maps
    // if (maxNumber > 1 && childrenAreMaps(oldNode, newNode)) {
    //   // if ALL children have keys (ALL = edge case)
    //   // get the children keys
    //
    //   const immediateParent = parent.childNodes[index];
    //   const oldNodeReference = {};
    //
    //   oldNode.get('children').forEach((val, index) => {
    //     const domKey = val.getIn(['props', 'key']);
    //     oldNodeReference[domKey] = immediateParent.childNodes[index];
    //   });
    //
    //   if (Object.keys(oldNodeReference).length === 0) {
    //     return;
    //   }
    //
    //   console.debug('DEBUG oldNodeReference', oldNodeReference)
    //
    //   const newItems = Array(maxNumber).fill().map((_, index) => {
    //     const oldIndex = oldNodeReference[key]; // where child with KEY is in old node
    //     const newVal = newNode.getIn(['children', index]) || null;
    //     const oldVal = oldNode.getIn(['children', index]) || null;
    //
    //     if (newVal === null) {
    //       immediateParent.removeChild(oldIndex);
    //       return;
    //     }
    //     const key = newVal.get('props').get('key');
    //
    //     console.debug('DEBUG for key', key, 'at old spot', oldNodeReference[key])
    //
    //     if (index > oldNode.get('children').size - 1) {
    //       console.debug('DEBUG VAL HIGHER - Create element for key', key);
    //       return { operation: 'create', node: newVal, key };
    //     } else if (index > newNode.get('children').size - 1) {
    //       return { operation: 'remove', node: oldVal, key };
    //     }
    //
    //     if (false === key in oldNodeReference) {
    //       console.debug('DEBUG Create element for key', key);
    //       const old = immediateParent.childNodes[index];
    //
    //       return { operation: 'replace', old, nodeToAdd: newVal, key };
    //       // return { operation: 'create', node: newVal, key };
    //     } else if (false === isEqual(oldVal, newVal)) {
    //       console.debug('DEBUG Replace element for key', key);
    //       const old = immediateParent.childNodes[index];
    //       console.debug('DEBUG', old, newVal)
    //
    //       return { operation: 'replace', old, nodeToAdd: newVal, key };
    //     }
    //
    //     console.debug('DEBUG they are equal, do nothing')
    //   });
    //
    //   newItems.forEach((domChange) => {
    //     if (!domChange) { return; }
    //     console.debug('DEBUG domChange for key', domChange.key);
    //     if (domChange.operation === 'replace') {
    //       console.debug('DEBUG replace', domChange.nodeToAdd, domChange.old);
    //       immediateParent.replaceChild(createElement(domChange.nodeToAdd), domChange.old);
    //     } else if (domChange.operation === 'create') {
    //       immediateParent.appendChild(createElement(domChange.node));
    //     }
    //   });
    //
    // }

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
