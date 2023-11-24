import Link from 'next/link'
import Title from './title'
import Statement from './statement'
import Spoilers from './spoilers'
import type { Props } from './types'
import Comments from './comments'
import ArchiveToggle from './archive-toggle'
import Lightbulbs from '@/components/lightbulbs'
import Likes from '@/components/likes';

// darker color first, for more contrast
const subjectToGradient = {
  'Algebra': {
    subject: 'Algebra',
    gradient: 'from-sky-500 to-cyan-500'
  },
  'Combinatorics': {
    subject: 'Combinatorics',
    gradient: 'from-amber-500 to-yellow-500'
  },
  'Geometry': {
    subject: 'Geometry',
    gradient: 'from-emerald-500 to-green-500'
  },
  'NumberTheory': {
    subject: 'Number Theory',
    gradient: 'from-violet-500 to-purple-500'
  },
}

function convertToSlug(name: string) {
  return name
    .toLowerCase() // Convert to lowercase
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/[^a-z0-9\-]/g, '') // Remove special characters except hyphens
    .replace(/\-+/g, '-'); // Replace multiple hyphens with a single hyphen
}

export default function ProblemPage(props: Props) {
  const { problem, collection, permission, userId } = props;
  let written_by;
  if (collection.showAuthors && problem.authors.length > 0) {
    written_by = <p className="italic text-slate-700 text-base mb-8 text-right">Written by {problem.authors[0].displayName}</p>;
  }

  let { subject, gradient } = subjectToGradient[problem.subject];

  return (
    <div className="p-8 text-slate-800 whitespace-pre-wrap break-words">
      <div className="mb-8 sm:mb-16 inline-block">
        <Link href={`/c/${collection.cid}`} prefetch={true} className="text-slate-600 hover:text-slate-800 underline flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
          <span className="ml-1">Back to {collection.name}</span>
        </Link>
      </div>
      {/* fixed width container, matching ideal 60-character line length */}
      <div className="mx-auto w-112 sm:w-128 md:w-144 max-w-full text-base sm:text-lg md:text-xl">
        <div className="flex gap-8">
          <div className="flex-grow">
            <div className="text-2xl sm:text-3xl text-slate-900 font-bold mb-4">
              <Title {...props} />
            </div>
            <div className="mb-6 font-semibold text-sm flex flex-wrap gap-x-3 gap-y-2">
              <div className={`py-2 px-6 text-slate-50 text-center leading-none rounded-full whitespace-nowrap bg-gradient-to-r ${gradient}`}>
                {subject}
              </div>
              {problem.testProblems.map(testProblem => (
                <Link href={`/c/${collection.cid}/t/${convertToSlug(testProblem.test.name)}-${testProblem.test.id}`} prefetch={true} className="py-2 px-6 bg-slate-200 hover:bg-slate-300 text-slate-700 hover:text-slate-800 text-center leading-none rounded-full whitespace-nowrap" key={testProblem.test.id}>
                  {testProblem.test.name}
                </Link>
              ))}
            </div>
          </div>
          <div className="text-base space-y-3 mt-2">
            <Likes problem={problem} userId={userId} />
            {problem.difficulty !== null && problem.difficulty > 0 &&
              <Lightbulbs difficulty={problem.difficulty} />
            }
          </div>
        </div>

        <div className="mb-4">
          <Statement {...props} />
        </div>
        {written_by}
        <Spoilers {...props} />
        <div>
          <Comments {...props} />
        </div>
        {(permission?.accessLevel === "Admin") && (
          <div>
            <ArchiveToggle {...props} />
          </div>
        )}
      </div>
    </div>
  );
}
