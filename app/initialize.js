/** @jsx Hummus.chickpea */

import { Hummus } from 'hummus-dom';
import { merge } from 'immutable';

// simple dom update
const exampleOne = function exampleOne() {
  const root = document.getElementById('root');

  const a = (
    <ul className="tehina">
      <li style="font-size: 22px;">1</li>
      <li>2</li>
      <li>3</li>
    </ul>
  )

  const b = (
    <ul>
      <li style="font-size: 44px;">1</li>
      <li>2</li>
      <li>3</li>
    </ul>
  )

  console.debug(a);

  Hummus.addNode(a);
  setTimeout(() => {
    console.log('Update');
    Hummus.updateNode(root, b, a);
  }, 3000)
};

// input form handling and updating
const exampleTwo = function exampleTwo() {
  const root = document.getElementById('root');

  let oldVal = '';
  const input = document.getElementById('type');
  input.addEventListener('input', (event) => {
    const newVal = (
      <span>{input.value}</span>
    );

    Hummus.updateNode(root, newVal, oldVal);
    oldVal = newVal;
  });
};

document.addEventListener('DOMContentLoaded', () => {
  exampleOne();
  // exampleTwo();
});
