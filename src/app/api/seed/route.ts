import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {

    // Create Products
    await prisma.product.createMany({
      data: [
        {
          name: "iPhone 15 Pro",
        },
        {
          name: "Samsung S24 Ultra",
        },
        {
          name: "MacBook Pro M4",
        },
      ],

      skipDuplicates: true,
    });

    // Create Warehouses
    await prisma.warehouse.createMany({
      data: [
        {
          name: "Hyderabad Warehouse",
        },
        {
          name: "Bangalore Warehouse",
        },
      ],

      skipDuplicates: true,
    });

    // Fetch inserted products and warehouses
    const products = await prisma.product.findMany();

    const warehouses = await prisma.warehouse.findMany();

    // Create inventory mapping
    for (const product of products) {

      for (const warehouse of warehouses) {

        await prisma.inventory.upsert({

          where: {
            productId_warehouseId: {
              productId: product.id,
              warehouseId: warehouse.id,
            },
          },

          update: {},

          create: {
            productId: product.id,
            warehouseId: warehouse.id,
            totalStock: 100,
            reservedStock: 0,
          },
        });

      }

    }

    return NextResponse.json({
      success: true,
      message: "Seeded Successfully",
    });

  } catch (error) {

    console.log(error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to seed database",
      },
      {
        status: 500,
      }
    );

  }
}