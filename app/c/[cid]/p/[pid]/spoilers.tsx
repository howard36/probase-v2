'use client'

import { useState } from 'react';
import Answer from './answer';
import Solution from './solution'
import type { Props } from './types'

export default function Spoilers(props: Props) {
  const { problem, collection, permission, authors } = props;
  const [hidden, setHidden] = useState(true);

  let answer, solution;
  if (problem.answer !== null) {
    answer = (
      <div className="my-8">
        <Answer {...props} />
      </div>
    );
  }
  if (problem.solutions.length > 0) {
    const sol = problem.solutions[0];
    solution = (
      <div className="my-8">
        <Solution solution={sol} collection={collection} permission={permission} authors={authors} />
      </div>
    );
  }

  if (hidden) {
    return (
      <div className="my-12">
        <button onClick={() => setHidden(false)} className="w-44 py-4 rounded-md bg-blue-500 hover:bg-blue-600 text-base text-slate-50 font-semibold leading-none">Show spoilers</button>
      </div>
    );
  } else {
    return (
      <div className="my-12">
        <button onClick={() => setHidden(true)} className="w-44 py-4 rounded-md bg-blue-500 hover:bg-blue-600 text-base text-slate-50 font-semibold leading-none">Hide spoilers</button>
        {answer}
        {solution}
        {/* Add Solution not implemented yet
        <button className="w-44 py-3 text-base text-blue-600 font-semibold rounded-md border-4 border-blue-200 hover:bg-blue-200 hover:text-blue-800 leading-none">Add Solution</button>
        */}
      </div>
    );
  };
}
