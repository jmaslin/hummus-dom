/** @jsx Hummus.chickpea */

import { Hummus } from 'hummus-dom';
import { toJS, merge } from 'immutable';

const root = document.getElementById('root');

const TODO_ITEMS = [];

const getIndexOfItem = function getIndexOfItem(findItem) {
  let index = -1;
  TODO_ITEMS.forEach((item, idx) => {
    if (item.text === findItem) { index = idx; }
  });

  return index;
};

const complete = function complete(e) {
  const targetKey = e.target.getAttribute('key');
  console.debug('CLICK EVENT', e.target, targetKey);

  // make sure not to apply event to deleted item
  if (!targetKey) {
    return;
  } else {
    const itemIndex = getIndexOfItem(targetKey);

    TODO_ITEMS.splice(itemIndex, 1, {
      text: targetKey,
      complete: !TODO_ITEMS[itemIndex].complete
    });

    updateList();
  }
};

// TODO: fix reference (get key)
const deleteItem = function deleteItem(e) {
  const itemToDelete = e.target.parentElement.childNodes[1].innerHTML;
  console.debug('DELETE TODO FOR', itemToDelete);

  const itemIndex = getIndexOfItem(itemToDelete);
  TODO_ITEMS.splice(itemIndex, 1);

  updateList();
};

const mapListItem = function mapListItem(item, index) {
  const colorClass = item.complete === false ? 'open': 'done';
  const numberEl = Hummus.chickpeaTwo('div', {className: 'number'}, [index+1+'']);
  const listEl = Hummus.chickpeaTwo('div', {className: colorClass}, [item.text]);
  const deleteBtn = Hummus.chickpeaTwo('button', {onClick: deleteItem}, ['remove']);
  return Hummus.chickpeaTwo('div', {className: 'todo', key: item.text, onClick: complete}, [numberEl, listEl, deleteBtn]);
};

let listCopy = Hummus.chickpeaTwo('ul', {className: 'tehina'}, [])

const button = document.getElementById('addItem');
button.addEventListener('click', () => {
  const addItem = document.getElementById('itemText').value.trim();
  document.getElementById('itemText').value = '';

  const exists = TODO_ITEMS.filter(item => item.text === addItem).length > 0;
  if (exists || addItem === '') { return; }

  TODO_ITEMS.push({ text: addItem, complete: false });

  updateList();
});

const updateList = function updateList() {
  const listItems = TODO_ITEMS.map(mapListItem);

  const newList = Hummus.chickpeaTwo('ul', {className: 'tehina'}, listItems)

  Hummus.updateNode(root, newList, listCopy);
  listCopy = newList;
};

document.addEventListener('DOMContentLoaded', () => {
  Hummus.addNode(listCopy);
});
