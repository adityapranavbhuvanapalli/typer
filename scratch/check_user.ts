import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function checkUser() {
  const user = await prisma.user.findUnique({
    where: { id: 'cmo8ugrrs00008zc93pvqs2iv' }
  })
  console.log('User Data:', JSON.stringify(user, null, 2))
}

checkUser()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
