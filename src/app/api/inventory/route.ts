import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const sampleInventory = [
  {
    id: "sample-1",
    totalStock: 10,
    reservedStock: 2,
    product: { id: "p1", name: "Sample Product A" },
    warehouse: { id: "w1", name: "Main Warehouse" },
  },
  {
    id: "sample-2",
    totalStock: 5,
    reservedStock: 1,
    product: { id: "p2", name: "Sample Product B" },
    warehouse: { id: "w2", name: "Secondary Warehouse" },
  },
];

export async function GET() {
  try {
    if (!process.env.DATABASE_URL) {
      return NextResponse.json({
        success: true,
        data: sampleInventory,
        message: "No database configured. Showing sample inventory.",
      });
    }

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
    console.error("Inventory API error:", error);

    return NextResponse.json({
      success: true,
      data: sampleInventory,
      message: "Could not connect to the database. Showing sample inventory.",
    });
  }
}
