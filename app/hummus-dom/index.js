import { Map, List } from 'immutable';

const createElement = function createElement(node) {
  if (typeof node === 'string') {
    return document.createTextNode(node);
  }
  const el = document.createElement(node.get('type'));

  node.get('children')
    .map(createElement)
    .forEach(el.appendChild.bind(el));

  return el;
}

const addNode = function addNode(node) {
  const root = document.getElementById('root');
  root.appendChild(createElement(node));
};

// Turn JSX syntax into plain objects
const chickpea = function chickpea(type, props, ...children) {
  return Map({ type, props, children: List(children) });
};

export const Hummus = {
  addNode,
  chickpea
};
