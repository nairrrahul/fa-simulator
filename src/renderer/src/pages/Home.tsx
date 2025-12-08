import FlagCard from "@renderer/components/FlagCard";
import { JSX } from "react";

export default function Home(): JSX.Element {

  const flagName = 'GUF';
  return (
  <div>
    <div className="text-white text-3xl">
      Home Screen
    </div>
    <FlagCard countryName={flagName} cssClasses={"w-12 h-8 object-cover:text-3xl"} />
  </div>
  );
}