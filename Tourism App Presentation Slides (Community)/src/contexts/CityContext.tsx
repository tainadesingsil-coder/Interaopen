import React, { createContext, useContext, useMemo, useState } from "react";

export type InterestCategory = 'nature' | 'historical' | 'culture' | 'restaurant' | 'hotel' | 'shop' | 'lake' | 'mountain' | 'waterfall';

interface CityContextValue {
  selectedCity: string;
  interests: InterestCategory[];
  setCity: (city: string) => void;
  setInterests: (interests: InterestCategory[]) => void;
}

const CityContext = createContext<CityContextValue | undefined>(undefined);

export function CityProvider({ children }: { children: React.ReactNode }) {
  const [selectedCity, setSelectedCity] = useState<string>("Belo Horizonte");
  const [interests, setInterests] = useState<InterestCategory[]>(["culture", "restaurant"]);

  const value = useMemo(
    () => ({
      selectedCity,
      interests,
      setCity: setSelectedCity,
      setInterests,
    }),
    [selectedCity, interests]
  );

  return <CityContext.Provider value={value}>{children}</CityContext.Provider>;
}

export function useCity() {
  const ctx = useContext(CityContext);
  if (!ctx) throw new Error("useCity must be used within CityProvider");
  return ctx;
}

