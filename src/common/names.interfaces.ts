
export interface GeneratedName {
  name: string;
  nationality: string;
  secondaryNationality?: string;
}

export interface NationalityInfo {
  primary: string;
  secondary?: string;
}

// ---------- types ------

export type NationDataProp = {
  nationsData: Record<string, string>;
};