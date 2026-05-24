import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { productId, warehouseId, quantity } = body;

    if (!productId || !warehouseId || !quantity) {
      return NextResponse.json(
        {
          success: false,
          message: "Missing required fields",
        },
        {
          status: 400,
        }
      );
    }

    const inventory = await prisma.inventory.findUnique({
      where: {
        productId_warehouseId: {
          productId,
          warehouseId,
        },
      },
    });

    if (!inventory) {
      return NextResponse.json(
        {
          success: false,
          message: "Inventory not found",
        },
        {
          status: 404,
        }
      );
    }

    const availableStock = inventory.totalStock - inventory.reservedStock;

    if (availableStock < quantity) {
      return NextResponse.json(
        {
          success: false,
          message: "Not enough stock available",
        },
        {
          status: 409,
        }
      );
    }

    await prisma.inventory.update({
      where: {
        id: inventory.id,
      },
      data: {
        reservedStock: {
          increment: quantity,
        },
      },
    });

    const reservation = await prisma.reservation.create({
      data: {
        productId,
        warehouseId,
        quantity,
        status: "PENDING",
        expiresAt: new Date(Date.now() + 10 * 60 * 1000),
      },
    });

    return NextResponse.json({
      success: true,
      data: reservation,
    });
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to create reservation",
      },
      {
        status: 500,
      }
    );
  }
}
