import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(
  req: Request,
  context: {
    params: Promise<{ id: string }>
  }
) {

  try {

    const { id } =
      await context.params;

    const reservation =
      await prisma.reservation.findUnique({
        where: { id },
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

    if (
      reservation.status !== "PENDING"
    ) {

      return NextResponse.json(
        {
          success: false,
          message: "Already processed",
        },
        {
          status: 400,
        }
      );

    }

    if (
      new Date() > reservation.expiresAt
    ) {

      return NextResponse.json(
        {
          success: false,
          message: "Reservation expired",
        },
        {
          status: 410,
        }
      );

    }

    const updatedReservation =
      await prisma.reservation.update({

        where: { id },

        data: {
          status: "CONFIRMED",
        },

      });

    return NextResponse.json({
      success: true,
      data: updatedReservation,
    });

  } catch {

    return NextResponse.json(
      {
        success: false,
        message: "Confirmation failed",
      },
      {
        status: 500,
      }
    );

  }

}