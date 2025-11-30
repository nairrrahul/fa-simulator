import { useState } from "react";
import { generateNewgenOvrPot } from "../../utils/NewgenOverall";
import { GeneratedName } from "../../common/names.interfaces";
import { realisticNameGenerator } from "../../utils/GenericNameGen";

function App(): React.JSX.Element {
  const [curPotAbs, setCurPotAbs] = useState({
    "currentAbility": 0,
    "potentialAbility": 0
  });

  const [nameInfo, setNameInfo] = useState<GeneratedName>({
    name: "",
    nationality: "",
    secondaryNationality: undefined
  });

  const generateOnClick = () => {
    setCurPotAbs(generateNewgenOvrPot(165, 17, true));
    setNameInfo(realisticNameGenerator("BRA"));
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 p-6">
      <div className="w-full max-w-md rounded-2xl bg-white shadow-lg p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          Newgen
        </h1>

        <p className="text-gray-600 mb-6">
          Name: {nameInfo.name}
          <br />
          Nationality: {nameInfo.nationality}
          {nameInfo.secondaryNationality && (
            <div>
              Second Nationality: {nameInfo.secondaryNationality}
            </div>
          )}
          {!nameInfo.secondaryNationality && <br />}
          CA: {curPotAbs["currentAbility"]} <br /> PA: {curPotAbs["potentialAbility"]}
        </p>

        <div className="flex space-x-3">
          <button
            className="
              px-4 py-2 rounded-lg bg-blue-600 
              text-white font-medium 
              hover:bg-blue-700 active:scale-95 
              transition-all duration-150
            "
            onClick={generateOnClick}
          >
            Generate
          </button>
        </div>
      </div>
    </div>
  );
}

export default App
