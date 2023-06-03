import clientPromise from '@/utils/mongodb';
import type { NextApiRequest, NextApiResponse } from 'next'
import { ObjectId } from 'mongodb';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../../auth/[...nextauth]';
import prisma from '@/utils/prisma';
import { connect } from 'http2';

// TODO: add permissions for API
export default async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== 'POST') {
    res.status(405).json({'error': 'Invalid method'});
    return;
  }

  // TODO: fix missing API route!
  const session = await getServerSession(req, res, authOptions);
  if (!session) {
    res.status(401);
    return;
  }

  // TODO: check if user is allowed to add problem
  const collectionId = Number(req.query._id);
  // TODO: add isAnonymous to api
  const { pid, title, subject, statement, authors, answer, solutions, submitterId } = req.body;

  // TODO: assign PID based on existing problems
  // PID should be given as input, and calculated by calling function
  // should this be in the problem form component?

  const result = await prisma.problem.create({
    data: {
      collectionId,
      pid,
      title,
      subject,
      statement,
      answer,
      likes: 0,
      difficulty: 0,
      isAnonymous: false,
      authors: {
        connect: authors.map((id) => ({ id }))
      },
      solutions: {
        create: [
          {
            text: solutions[0].text,
            authors: {
              connect: solutions[0].authors
            }
          }
        ]
      },
      submitterId,
    }
  });

  // TODO: properly handle creation error
  // should be try-catch instead
  if (result) {
    res.status(201).json({inserted_id: result.id});
  } else {
    res.status(500).json({'error': 'Failed to add problem'});
  }
}

