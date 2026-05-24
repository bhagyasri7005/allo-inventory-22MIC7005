import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {

  try {

    const { id } = await context.params;

    const reservation =
      await prisma.reservation.findUnique({
        where: {
          id,
        },
      });

    if (!reservation) {

      return NextResponse.json(
        {
          success: false,
          message: "Reservation not found",
        },
        {
          status: 404,
        }
      );

    }

    if (reservation.status === "RELEASED") {

      return NextResponse.json(
        {
          success: false,
          message: "Already released",
        },
        {
          status: 400,
        }
      );

    }

    // Reduce reserved stock
    const inventory =
      await prisma.inventory.findUnique({
        where: {
          productId_warehouseId: {
            productId: reservation.productId,
            warehouseId: reservation.warehouseId,
          },
        },
      });

    if (inventory) {

      await prisma.inventory.update({
        where: {
          id: inventory.id,
        },

        data: {
          reservedStock: {
            decrement: reservation.quantity,
          },
        },
      });

    }

    // Update reservation
    const updatedReservation =
      await prisma.reservation.update({
        where: {
          id,
        },

        data: {
          status: "RELEASED",
        },
      });

    return NextResponse.json({
      success: true,
      reservation: updatedReservation,
    });

  } catch (error) {

    console.log(error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to release reservation",
      },
      {
        status: 500,
      }
    );

  }

}