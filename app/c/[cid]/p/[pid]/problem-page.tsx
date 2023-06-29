'use client'

import Sidebar from '@/components/sidebar'
import EditableTitle from '@/components/editable-title'
import EditableStatement from '@/components/editable-statement'
import ProblemSpoilers from '@/components/problem-spoilers'
import { Problem, Solution, Author } from '@prisma/client'

interface SolutionWithAuthor extends Solution {
  authors: Pick<Author, 'displayName'>[];
}

interface ProblemWithSolution extends Problem {
  solutions: SolutionWithAuthor[];
}

export default function ProblemPage({
  problem
}: {
  problem: ProblemWithSolution
}) {
  let written_by;
  const sol = problem.solutions[0];
  if (sol.authors.length > 0) {
    written_by = <p className="italic mb-8 text-right">Written by {sol.authors[0].displayName}</p>;
  }

  return (
    <Sidebar>
      {/* fixed width container, matching ideal 60-character line length.
      TODO: should be max-width */}
      <div className="w-128 mx-auto my-24">
        <div className="text-3xl font-bold mb-4">
          <EditableTitle problem={problem}/>
        </div>
        <div className="text-xl mb-4">
          <EditableStatement problem={problem}/>
        </div>
        {written_by}
        <ProblemSpoilers problem={problem}/>
      </div>
    </Sidebar>
  );
}
