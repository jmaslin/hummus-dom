/** @jsx Hummus.chickpea */

import { Hummus } from '../app/hummus-dom';
import { toJS } from 'immutable';
import { isEqual } from 'underscore';

test('jsx transformation works', () => {
  const input = (
    <div className="hello">world</div>
  );

  const expected = {
    type: 'div',
    props: { className: 'hello' },
    children: ['world']
  };

  expect(isEqual(input.toJS(), expected)).toBe(true);
});
