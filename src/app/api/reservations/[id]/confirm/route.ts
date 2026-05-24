import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {

  try {

    const { id } = await context.params;

    const reservation = await prisma.reservation.findUnique({
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

    if (reservation.status === "CONFIRMED") {

      return NextResponse.json(
        {
          success: false,
          message: "Already confirmed",
        },
        {
          status: 400,
        }
      );

    }

    const updatedReservation =
      await prisma.reservation.update({
        where: {
          id,
        },

        data: {
          status: "CONFIRMED",
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
        message: "Failed to confirm reservation",
      },
      {
        status: 500,
      }
    );

  }

}