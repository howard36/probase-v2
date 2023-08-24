import ProblemCard from './problem-card'
import prisma from '@/utils/prisma'
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import type { Subject } from '@prisma/client'
import type { Params, CollectionProps } from './types'
import { collectionSelect } from './types'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/api/auth/[...nextauth]'
import { canViewCollection } from '@/utils/permissions'

// export async function generateStaticParams(): Promise<Params[]> {
//   if (process.env.NO_WIFI === "true") {
//     return [
//       { cid: 'cmimc' }
//     ];
//   }

//   const params = await prisma.collection.findMany({
//     select: { cid: true }
//   });
//   return params;
// }

async function getCollection(cid: string): Promise<CollectionProps> {
  if (process.env.NO_WIFI === "true") {
    return {
      id: 1,
      cid: 'cmimc',
      name: 'CMIMC',
      problems: [
        {
          pid: 'A1',
          title: 'Quadratic Equation',
          subject: 'Algebra' as Subject,
          statement: 'Compute the roots of $$x^2 - 4x + 2$$',
        },
        {
          pid: 'A2',
          title: 'Quadratic Equation',
          subject: 'Combinatorics' as Subject,
          statement: 'Compute the roots of $$x^2 - 4x + 2$$',
        },
        {
          pid: 'A3',
          title: 'Quadratic Equation',
          subject: 'Geometry' as Subject,
          statement: 'Compute the roots of $$x^2 - 4x + 2$$',
        },
        {
          pid: 'A4',
          title: 'Quadratic Equation',
          subject: 'NumberTheory' as Subject,
          statement: 'Compute the roots of $$x^2 - 4x + 2$$',
        },
        {
          pid: 'A5',
          title: 'Quadratic Equation',
          subject: 'Algebra' as Subject,
          statement: 'Compute the roots of $$x^2 - 4x + 2$$',
        },
      ],
    }
  }

  const collection = await prisma.collection.findUnique({
    where: { cid },
    select: collectionSelect,
  });

  if (collection === null) {
    notFound();
  }

  return collection;
}

export default async function CollectionPage({
  params
}: {
  params: Params
}) {
  const { cid } = params;
  const session = await getServerSession(authOptions);
  if (session === null) {
    // Not logged in
    redirect(`/api/auth/signin?callbackUrl=%2Fc%2F${cid}`);
  }

  const userId = session.userId;
  if (userId === undefined) {
    throw new Error("userId is undefined despite being logged in");
  }

  const collection = await getCollection(cid);
  const permission = await prisma.permission.findUnique({
    where: {
      userId_collectionId: {
        userId,
        collectionId: collection.id,
      }
    }
  });
  if (permission === null || !canViewCollection(permission.accessLevel)) {
    // No permission
    redirect("/need-permission");
  }

  return (
    <div className="p-8 md:py-24 whitespace-pre-wrap break-words">
      <div className="w-128 sm:w-144 md:w-160 max-w-full mx-auto">
        {/* TODO: blue shadow */}
        <Link href={`/c/${cid}/add-problem`} className="my-8 py-4 px-8 rounded-xl bg-blue-500 hover:bg-blue-600 text-slate-50 font-semibold text-lg soft-shadow-xl">Add Problem</Link>
        <div>
          <ul id="problems">
            {collection.problems.map((problem) => (
              <li key={problem.pid}>
                <ProblemCard collection={collection} problem={problem} />
              </li>
            )).reverse()}
          </ul>
        </div>
      </div>
    </div>
  );
}

