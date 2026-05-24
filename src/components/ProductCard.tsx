"use client";

import axios from "axios";

import toast from "react-hot-toast";

interface InventoryItem {

  id: string;

  totalStock: number;

  reservedStock: number;

  product: {
    id: string;
    name: string;
  };

  warehouse: {
    id: string;
    name: string;
  };

}

interface Props {
  item: InventoryItem;
}

export default function ProductCard({
  item,
}: Props) {

  const availableStock =
    item.totalStock -
    item.reservedStock;

  const handleReserve = async () => {

    try {

      const response =
        await axios.post(
          "/api/reservations",
          {
            productId:
              item.product.id,

            warehouseId:
              item.warehouse.id,

            quantity: 1,
          }
        );

      console.log(response.data);

      toast.success(
        "Reservation created"
      );

      window.location.href =
        `/reservation/${response.data.data.id}`;

    } catch (error: any) {

      console.log(error);

      toast.error(
        error.response?.data?.message
        || "Reservation failed"
      );

    }

  };

  return (

    <div className="
      bg-white
      rounded-xl
      shadow-md
      p-5
      border
    ">

      <h2 className="
        text-2xl
        font-bold
        mb-3
      ">
        {item.product.name}
      </h2>

      <p className="mb-2">

        Warehouse:
        {" "}

        <span className="
          font-semibold
        ">
          {item.warehouse.name}
        </span>

      </p>

      <p className="mb-4">

        Available Stock:
        {" "}

        <span className="
          font-bold
          text-green-600
        ">
          {availableStock}
        </span>

      </p>

      <button
        onClick={handleReserve}
        disabled={
          availableStock <= 0
        }
        className="
          bg-black
          text-white
          px-4
          py-2
          rounded-lg
          disabled:bg-gray-400
        "
      >
        Reserve
      </button>

    </div>

  );

}