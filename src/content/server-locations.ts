import pack from "@/content/server-locations-i18n.json";

/** Datacenter / server presence shown on /diensten/categorie/hosting. */

export type ServerLocationCopy = {
  title: string;
  regions: Array<{
    id: string;
    name: string;
    subregions: Array<{
      id: string;
      name: string;
      locations: string[];
    }>;
  }>;
};

type Pack = Record<string, ServerLocationCopy>;

const NL: ServerLocationCopy = {
  title: "Serverlocaties per regio",
  regions: [
    {
      id: "asia",
      name: "Azië",
      subregions: [
        {
          id: "south-asia",
          name: "Zuid-Azië",
          locations: ["India (Mumbai)"],
        },
        {
          id: "southeast-asia",
          name: "Zuidoost-Azië",
          locations: ["Indonesië", "Maleisië", "Singapore"],
        },
      ],
    },
    {
      id: "europe",
      name: "Europa",
      subregions: [
        {
          id: "eastern-europe",
          name: "Oost-Europa",
          locations: ["Litouwen"],
        },
        {
          id: "west-north-europe",
          name: "West- en Noord-Europa",
          locations: [
            "Duitsland (Frankfurt)",
            "Frankrijk",
            "Nederland",
            "Verenigd Koninkrijk",
          ],
        },
      ],
    },
    {
      id: "north-america",
      name: "Noord-Amerika",
      subregions: [
        {
          id: "united-states",
          name: "Verenigde Staten",
          locations: [
            "Asheville, Noord-Carolina",
            "Boston, Massachusetts",
            "Phoenix, Arizona",
          ],
        },
      ],
    },
    {
      id: "south-america",
      name: "Zuid-Amerika",
      subregions: [
        {
          id: "latin-america",
          name: "Latijns-Amerika",
          locations: ["Brazilië"],
        },
      ],
    },
  ],
};

const EN: ServerLocationCopy = {
  title: "Server locations by region",
  regions: [
    {
      id: "asia",
      name: "Asia",
      subregions: [
        {
          id: "south-asia",
          name: "South Asia",
          locations: ["India (Mumbai)"],
        },
        {
          id: "southeast-asia",
          name: "Southeast Asia",
          locations: ["Indonesia", "Malaysia", "Singapore"],
        },
      ],
    },
    {
      id: "europe",
      name: "Europe",
      subregions: [
        {
          id: "eastern-europe",
          name: "Eastern Europe",
          locations: ["Lithuania"],
        },
        {
          id: "west-north-europe",
          name: "Western & Northern Europe",
          locations: [
            "Germany (Frankfurt)",
            "France",
            "Netherlands",
            "United Kingdom",
          ],
        },
      ],
    },
    {
      id: "north-america",
      name: "North America",
      subregions: [
        {
          id: "united-states",
          name: "United States",
          locations: [
            "Asheville, North Carolina",
            "Boston, Massachusetts",
            "Phoenix, Arizona",
          ],
        },
      ],
    },
    {
      id: "south-america",
      name: "South America",
      subregions: [
        {
          id: "latin-america",
          name: "Latin America",
          locations: ["Brazil"],
        },
      ],
    },
  ],
};

export function serverLocationsCopy(locale: string): ServerLocationCopy {
  if (locale === "nl") return NL;
  if (locale === "en") return EN;
  const localized = (pack as Pack)[locale];
  return localized || EN;
}

export { EN as SERVER_LOCATIONS_EN };
