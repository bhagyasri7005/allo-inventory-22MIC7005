import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {

    const inventory = await prisma.inventory.findMany({
      include: {
        product: true,
        warehouse: true,
      },
    });

    return NextResponse.json({
      success: true,
      data: inventory,
    });

  } catch (error) {

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch inventory",
      },
      {
        status: 500,
      }
    );

  }
}