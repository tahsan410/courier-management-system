import { useEffect } from "react";

export default function useDocumentTitle(title) {
  useEffect(() => {
    document.title = title
      ? `${title} · CourierExpress`
      : "CourierExpress — Fast, Reliable Parcel Delivery";
  }, [title]);
}
