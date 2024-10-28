import prisma from '@/lib/prisma'

export async function mergeGuestOrders(guestEmail: string, userEmail: string) {
  try {
    // Get the user account
    const user = await prisma.user.findUnique({
      where: { email: userEmail }
    });

    if (!user) {
      throw new Error('User not found');
    }

    // Find guest account
    const guestUser = await prisma.user.findUnique({
      where: { email: guestEmail }
    });

    if (!guestUser) {
      return; // No guest orders to merge
    }

    // Update all orders from guest account to the logged-in user
    await prisma.order.updateMany({
      where: { userId: guestUser.id },
      data: { userId: user.id }
    });

    // Optionally delete the guest user account
    await prisma.user.delete({
      where: { id: guestUser.id }
    });

    console.log(`Merged orders from ${guestEmail} to ${userEmail}`);
  } catch (error) {
    console.error('Error merging guest orders:', error);
    throw error;
  }
}