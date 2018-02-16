/** @jsx Hummus.chickpea */

import { Hummus } from 'hummus-dom';
import { toJS, merge } from 'immutable';

const root = document.getElementById('root');
const storage = window.localStorage;

let listCopy;

const demoList = [{
  text: 'Hummus',
  complete: false
}, {
  text: 'Carrots',
  complete: false
}, {
  text: 'Pita Chips',
  complete: true
}];

const getTodoList = function getTodoList() {
  const list = JSON.parse(storage.todoList);
  console.debug('list', list);
  return list;
};

const updateTodoList = function updateTodoList(list) {
  console.debug('update list', JSON.stringify(list));
  storage.todoList = JSON.stringify(list);
};

const getIndexOfItem = function getIndexOfItem(findItem) {
  let index = -1;
  const todoList = getTodoList();
  todoList.forEach((item, idx) => {
    if (item.text === findItem) { index = idx; }
  });

  return index;
};

const setItemComplete = function setItemComplete(targetKey) {
  const list = getTodoList();
  const newList = list.map((item) => {
    if (item.text === targetKey) {
      item.complete = !item.complete;
    }
    return item;
  });

  return newList;
};

const removeItemFromList = function removeItemFromList(itemIndex) {
  const newList = getTodoList();
  newList.splice(itemIndex, 1);

  return newList;
};

const complete = function complete(e) {
  const targetKey = e.target.getAttribute('key');
  console.debug('CLICK EVENT', e.target, targetKey);

  // make sure not to apply event to deleted item
  if (!targetKey) {
    return;
  } else {
    const itemIndex = getIndexOfItem(targetKey);
    const newList = setItemComplete(targetKey);

    updateTodoList(newList);
    updateListDOM();
  }
};

// TODO: fix reference (get key) if click on actual text
const deleteItem = function deleteItem(e) {
  console.debug('deleteItem', e.target.parentElement);
  const itemToDelete = e.target.parentElement.getAttribute('key');
  console.debug('DELETE TODO FOR', itemToDelete);

  const itemIndex = getIndexOfItem(itemToDelete);
  const newList = removeItemFromList(itemIndex);

  updateTodoList(newList);
  updateListDOM();
};

const mapListItem = function mapListItem(item, index) {
  const colorClass = item.complete === false ? 'open': 'done';
  const className = ['todo', 'list-group-item', colorClass].join(' ');
  // const numberEl = Hummus.chickpeaTwo('div', {className: 'number'}, [index+1+'']);
  const listEl = Hummus.chickpeaTwo('p', {}, [item.text]);
  const deleteBtn = Hummus.chickpeaTwo('button', {className: 'btn btn-sm btn-delete btn btn-danger', onClick: deleteItem}, ['remove']);
  return Hummus.chickpeaTwo('li', {className, key: item.text, onClick: complete}, [listEl, deleteBtn]);
};


const button = document.getElementById('addItem');
button.addEventListener('click', () => {
  const list = getTodoList();
  const addItem = document.getElementById('itemText').value.trim();
  const exists = list.filter(item => item.text === addItem).length > 0;

  document.getElementById('itemText').value = '';

  if (!exists && addItem !== '') {
    list.push({ text: addItem, complete: false });
    updateTodoList(list);
    updateListDOM();
  }
});


const updateListDOM = function updateListDOM() {
  console.debug('TODO ITEMS:', getTodoList());

  const listItems = getTodoList().map(mapListItem);
  const newList = Hummus.chickpeaTwo('ul', {className: 'list-group col-sm'}, listItems)

  Hummus.updateNode(root, newList, listCopy);
  listCopy = newList;
};

document.addEventListener('DOMContentLoaded', () => {
  console.debug('DOM loaded');
  if (!storage.todoList || getTodoList().length === 0) { updateTodoList(demoList) }

  updateListDOM();
});
