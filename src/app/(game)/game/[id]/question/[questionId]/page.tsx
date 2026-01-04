import QuestionClient from './QuestionClient';

type PageProps = {
  params: { id: string; questionId: string };
};

/**
 * Server component shell for the question page.
 * All heavy game state is already in Redux from game/[id] hydration.
 * This page simply extracts the params and passes them to the client component.
 */
export default async function QuestionPage({ params }: PageProps) {
  const gameId = params.id;
  const questionId = parseInt(params.questionId, 10);

  return <QuestionClient gameId={gameId} questionId={questionId} />;
}
