import FlagCard from "@renderer/components/FlagCard";
import { JSX } from "react";

export default function Home(): JSX.Element {

  const flagName = 'GUF';
  return (
  <div>
    <div className="text-white text-3xl">
      Home Screen
    </div>
    <FlagCard countryName={flagName} />
  </div>
  );
}