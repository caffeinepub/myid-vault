import { useEffect, useState } from "react";
import { getBackgroundPreference } from "../lib/storage";
import AnimatedBackground, { type BgStyle } from "./AnimatedBackground";

export default function AppBackground() {
  const [bgStyle, setBgStyle] = useState<string>(() =>
    getBackgroundPreference(),
  );
  const [photoUrl, setPhotoUrl] = useState<string>(
    () => localStorage.getItem("myid_bg_photo") || "",
  );

  useEffect(() => {
    const handler = (e: Event) => {
      const customE = e as CustomEvent<string>;
      const val = customE.detail;
      setBgStyle(val);
      if (val === "photo") {
        setPhotoUrl(localStorage.getItem("myid_bg_photo") || "");
      }
    };
    window.addEventListener("myid-bg-change", handler);
    return () => window.removeEventListener("myid-bg-change", handler);
  }, []);

  return <AnimatedBackground style={bgStyle as BgStyle} photoUrl={photoUrl} />;
}
