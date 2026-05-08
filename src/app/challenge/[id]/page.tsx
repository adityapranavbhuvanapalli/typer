import prisma from '@/lib/db'
import { notFound } from 'next/navigation'
import ChallengeWorkspace from './ChallengeWorkspace'
import { auth } from '@/auth'

export default async function ChallengePage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params
  const [session, challenge] = await Promise.all([
    auth(),
    prisma.challenge.findUnique({
      where: { id: params.id }
    })
  ])

  if (!challenge) {
    notFound()
  }

  return (
    <div className="min-h-[calc(100vh-80px)] w-full flex items-center justify-center p-6 pb-24">
      <ChallengeWorkspace 
        challenge={challenge} 
        isGuest={!session?.user} 
      />
    </div>
  )
}
