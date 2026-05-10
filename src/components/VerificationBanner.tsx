import { auth } from "@/auth"
import BannerClient from "./VerificationBannerClient"

export default async function VerificationBanner() {
  const session = await auth()

  if (!session?.user) return null

  // If the user is verified, hide it
  if (session.user.emailVerified) return null

  return <BannerClient email={session.user.email || ''} />
}
