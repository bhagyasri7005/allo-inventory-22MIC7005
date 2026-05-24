import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// This endpoint is intended to be called by a scheduler (Vercel Cron)
// It finds reservations with status='PENDING' and expiresAt < now,
// decrements reservedStock on the corresponding inventory, and marks
// the reservation as 'RELEASED'. Each reservation is handled in a
// transaction to keep operations consistent.

export async function GET() {
  try {
    const now = new Date();

    const expired = await prisma.reservation.findMany({
      where: {
        status: "PENDING",
        expiresAt: {
          lt: now,
        },
      },
    });

    let released = 0;

    for (const r of expired) {
      // perform inventory decrement and reservation update in a transaction
      try {
        await prisma.$transaction([
          prisma.inventory.update({
            where: {
              productId_warehouseId: {
                productId: r.productId,
                warehouseId: r.warehouseId,
              },
            },
            data: {
              reservedStock: {
                decrement: r.quantity,
              },
            },
          }),
          prisma.reservation.update({
            where: { id: r.id },
            data: { status: "RELEASED" },
          }),
        ]);

        released += 1;
      } catch (err) {
        // log and continue with next reservation
        console.error("Failed to release reservation", r.id, err);
      }
    }

    return NextResponse.json({ success: true, released });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { success: false, message: "Failed to release expired reservations" },
      { status: 500 }
    );
  }
}
