import fCode from '../../../data/flag_codes.json'  with { type: 'json' };
const FLAG_CODES = fCode as Record<string, string>;

export default function FlagCard({countryName}) {


  const getFlagCode = (threeLetterCode: string) => {
    return threeLetterCode in FLAG_CODES ? FLAG_CODES[threeLetterCode] : 'xx';
  };

  const primaryFlagCode = getFlagCode(countryName);

  return (
    <div>
        {['bq', 'gf', 'gp', 'zb', 're'].includes(primaryFlagCode) ? (
        <img
          src={new URL(`../assets/flags/${primaryFlagCode}.svg`, import.meta.url).href}
          alt={countryName}
          title={countryName}
          className="w-12 h-8 object-cover"
        />
      ) : (
        <span
          className={`fi fi-${primaryFlagCode} text-3xl`}
          title={countryName}
        >
        </span>
      )}
    </div>
  );
}