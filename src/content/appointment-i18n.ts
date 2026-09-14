import appointmentI18n from "@/content/appointment-i18n.json";

type Copy = { title: string; description: string };

type AppointmentPack = {
  extras: Record<string, Copy>;
  prefs: Record<string, Copy>;
};

const packs = appointmentI18n as Record<string, AppointmentPack>;

function packFor(locale: string): AppointmentPack {
  return packs[locale] || packs.en || { extras: {}, prefs: {} };
}

export function appointmentExtraCopy(id: string, locale: string): Copy {
  const pack = packFor(locale);
  return (
    pack.extras[id] ||
    packs.en?.extras[id] || { title: id, description: "" }
  );
}

export function appointmentPrefCopy(id: string, locale: string): Copy {
  const pack = packFor(locale);
  return (
    pack.prefs[id] ||
    packs.en?.prefs[id] || { title: id, description: "" }
  );
}
