"use client";

import Link from "next/link";
import Title from "./title";
import Statement from "./statement";
import Spoilers from "./spoilers";
import type { Props } from "./types";
import Comments from "./comments";
import ArchiveToggle from "./archive-toggle";
import Lightbulbs from "@/components/lightbulbs";
import Likes from "@/components/likes";
import LockedPage from "./locked-page";
import Testsolve from "./testsolve";
import Leaderboard from "./leaderboard";
import { canEditProblem } from "@/lib/permissions";
import BackButton from "@/components/back-button";
import { useRouter } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft, faArrowRight } from "@fortawesome/free-solid-svg-icons";
import { Filter, filterToString } from "@/lib/filter";

// darker color first, for more contrast
const subjectToGradient = {
  Algebra: {
    subject: "Algebra",
    gradient: "from-blue-500 to-indigo-500",
  },
  Combinatorics: {
    subject: "Combinatorics",
    gradient: "from-amber-500 to-orange-400",
  },
  Geometry: {
    subject: "Geometry",
    gradient: "from-green-500 to-emerald-500",
  },
  NumberTheory: {
    subject: "Number Theory",
    gradient: "from-rose-500 to-red-500",
  },
};

function convertToSlug(name: string) {
  return name
    .toLowerCase() // Convert to lowercase
    .replace(/\s+/g, "-") // Replace spaces with hyphens
    .replace(/[^a-z0-9\-]/g, "") // Remove special characters except hyphens
    .replace(/\-+/g, "-"); // Replace multiple hyphens with a single hyphen
}

interface PropsWithFilter extends Props {
  filter: Filter;
}

export default function ProblemPage(props: PropsWithFilter) {
  const router = useRouter();
  const { problem, collection, permission, userId, authors, filter } = props;

  const filterStr = filterToString(filter);

  let written_by;
  if (
    problem.authors.length > 0 &&
    (collection.showAuthors || permission.accessLevel === "Admin")
  ) {
    written_by = (
      <p className="mb-8 text-right text-base italic text-slate-700">
        Written by {problem.authors[0].displayName}
      </p>
    );
  }

  const { subject, gradient } = subjectToGradient[problem.subject];

  // TODO: make this a separate Testsolving component
  let testsolveOrAnswers;
  if (
    collection.requireTestsolve &&
    permission.testsolverType !== "Casual" &&
    permission.seriousTestsolverStartedAt !== null &&
    permission.seriousTestsolverStartedAt < problem.createdAt &&
    !canEditProblem(problem, permission, authors)
  ) {
    const difficulty = problem.difficulty;
    if (difficulty === null || difficulty === 0) {
      throw new Error(
        "Difficulty is null or zero, cannot determine testsolve time",
      );
    }
    const testsolveTimeMinutes = difficulty * 5 + 5; // 10, 15, 20, 25, 30

    const solveAttempt = problem.solveAttempts.find(
      (attempt) => attempt.userId === userId,
    );
    if (solveAttempt === undefined) {
      testsolveOrAnswers = (
        <LockedPage
          problem={problem}
          time={`${testsolveTimeMinutes} minutes`}
          unsolved={problem.solveAttempts.every(
            (attempt) => attempt.solvedAt === null,
          )}
        />
      );
    } else {
      const testsolveTimeMillis = testsolveTimeMinutes * 60 * 1000;
      const deadline = new Date(
        solveAttempt.startedAt.getTime() + testsolveTimeMillis,
      );
      const finished =
        new Date() >= deadline ||
        solveAttempt.gaveUp ||
        solveAttempt.solvedAt !== null;

      if (finished) {
        // TODO: move this into a component
        testsolveOrAnswers = (
          <div>
            <div className="mb-4">
              <Statement {...props} />
            </div>
            {written_by}
            <Spoilers {...props} />
            {collection.requireTestsolve && (
              <Leaderboard
                solveAttempts={problem.solveAttempts}
                userId={userId}
                canViewAll={canEditProblem(problem, permission, authors)}
              />
            )}
            <Comments {...props} />
          </div>
        );
      } else {
        // Currently testsolving
        // TODO: show timer, input box, give up button
        testsolveOrAnswers = (
          <div>
            <div className="mb-8">
              <Statement {...props} />
            </div>
            <hr className="my-8" />
            <Testsolve
              problem={problem}
              deadline={deadline}
              answerFormat={collection.answerFormat}
            />
          </div>
        );
      }
    }
  } else {
    testsolveOrAnswers = (
      <div>
        <div className="mb-4">
          <Statement {...props} />
        </div>
        {written_by}
        <Spoilers {...props} />
        {collection.requireTestsolve && (
          <Leaderboard
            solveAttempts={problem.solveAttempts}
            userId={userId}
            canViewAll={canEditProblem(problem, permission, authors)}
          />
        )}
        <Comments {...props} />
      </div>
    );
  }

  const currentPid = problem.pid;
  const nextPid = incrementPid(currentPid);
  const prevPid = decrementPid(currentPid);
  const hasPrevProblem = prevPid !== null;

  const handleNextProblem = () => {
    router.push(`/c/${collection.cid}/p/${nextPid}${filterStr}`);
  };

  const handlePrevProblem = () => {
    if (hasPrevProblem) {
      router.push(`/c/${collection.cid}/p/${prevPid}${filterStr}`);
    }
  };

  return (
    <div className="whitespace-pre-wrap break-words p-8 text-slate-800">
      <div className="mb-8 inline-block sm:mb-16">
        <BackButton
          href={`/c/${collection.cid}${filterStr}`}
          label={`Back to ${collection.name}`}
        />
      </div>
      <div className="mx-auto w-112 max-w-full text-base sm:w-128 sm:text-lg md:w-144 md:text-xl">
        <div className="flex gap-8">
          <div className="flex-grow">
            <div className="mb-4 text-xl font-bold md:text-2xl">
              <Title {...props} />
            </div>
            <div className="mb-6 flex flex-wrap gap-x-3 gap-y-2 text-sm font-semibold">
              <Link
                href={`/c/${collection.cid}?subject=${subject.charAt(0).toLowerCase()}`}
                className={`whitespace-nowrap rounded-full bg-gradient-to-br px-6 py-2 text-center leading-none text-white ${gradient}`}
                prefetch={true}
              >
                {subject}
              </Link>
              {problem.testProblems.map((testProblem) => (
                <Link
                  href={`/c/${collection.cid}/t/${convertToSlug(
                    testProblem.test.name,
                  )}-${testProblem.test.id}`}
                  prefetch={true}
                  className="whitespace-nowrap rounded-full bg-slate-200 px-6 py-2 text-center leading-none text-slate-700 hover:bg-slate-300 hover:text-slate-800"
                  key={testProblem.test.id}
                >
                  {testProblem.test.name}
                </Link>
              ))}
            </div>
          </div>
          <div className="mt-2 space-y-3 text-base">
            <Likes problem={problem} userId={userId} />
            {problem.difficulty !== null && problem.difficulty > 0 && (
              <Lightbulbs difficulty={problem.difficulty} />
            )}
          </div>
        </div>

        {/* Statement should also be hidden if they haven't clicked "Start testsolve" */}
        {testsolveOrAnswers}
        {canEditProblem(problem, permission, authors) && (
          <div className="mt-8">
            <ArchiveToggle {...props} />
          </div>
        )}

        <div className="mt-4 flex items-center justify-between">
          <button
            onClick={handlePrevProblem}
            disabled={!hasPrevProblem}
            className={`flex items-center rounded px-4 py-2 text-sm font-bold transition-colors ${
              hasPrevProblem
                ? "text-slate-500 hover:text-slate-700"
                : "cursor-not-allowed text-slate-300"
            }`}
          >
            <FontAwesomeIcon icon={faArrowLeft} className="mr-2" />
            Previous
          </button>
          <button
            onClick={handleNextProblem}
            className="flex items-center rounded px-4 py-2 text-sm font-bold text-slate-500 transition-colors hover:text-slate-700"
          >
            Next
            <FontAwesomeIcon icon={faArrowRight} className="ml-2" />
          </button>
        </div>
      </div>
    </div>
  );
}

function incrementPid(pid: string): string {
  const letter = pid.charAt(0);
  const number = parseInt(pid.slice(1), 10);
  return `${letter}${number + 1}`;
}

function decrementPid(pid: string): string | null {
  const letter = pid.charAt(0);
  const number = parseInt(pid.slice(1), 10);
  if (number <= 1) {
    return null;
  }
  return `${letter}${number - 1}`;
}
