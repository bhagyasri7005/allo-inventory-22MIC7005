import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET ALL WAREHOUSES
export async function GET() {

  try {

    const warehouses =
      await prisma.warehouse.findMany({
        orderBy: {
          createdAt: "desc",
        },
      });

    return NextResponse.json({
      success: true,
      data: warehouses,
    });

  } catch (error) {

    console.log(error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch warehouses",
      },
      {
        status: 500,
      }
    );

  }

}

// CREATE NEW WAREHOUSE
export async function POST(req: Request) {

  try {

    const body = await req.json();

    const { name } = body;

    if (!name) {

      return NextResponse.json(
        {
          success: false,
          message: "Warehouse name is required",
        },
        {
          status: 400,
        }
      );

    }

    const warehouse =
      await prisma.warehouse.create({
        data: {
          name,
        },
      });

    return NextResponse.json({
      success: true,
      warehouse,
    });

  } catch (error) {

    console.log(error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to create warehouse",
      },
      {
        status: 500,
      }
    );

  }

}