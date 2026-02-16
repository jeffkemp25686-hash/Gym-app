import { useEffect } from "react";
import { bootApp } from "./appCore";

export default function App() {
  useEffect(() => {
    bootApp();
  }, []);

  return <div id="app"></div>;
}
