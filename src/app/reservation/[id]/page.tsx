"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

export default function ReservationPage() {

  const params = useParams();

  const id = params.id;

  const [data, setData] = useState<any>(null);

  useEffect(() => {

    async function fetchData() {

      const res = await fetch(
        `/api/reservations/${id}`
      );

      const json = await res.json();

      console.log(json);

      setData(json.data);

    }

    if (id) {
      fetchData();
    }

  }, [id]);

  if (!data) {

    return (
      <div className="p-10">
        Loading...
      </div>
    );

  }

  return (

    <div className="p-10">

      <h1 className="text-4xl font-bold mb-6">
        Reservation Details
      </h1>

      <p>
        Product:
        {" "}
        {data.product.name}
      </p>

      <p>
        Warehouse:
        {" "}
        {data.warehouse.name}
      </p>

      <p>
        Quantity:
        {" "}
        {data.quantity}
      </p>

      <p>
        Status:
        {" "}
        {data.status}
      </p>

    </div>

  );

}