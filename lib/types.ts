export type HymnMetadata = {
  title: string;
  subtitle?: string;
  artist?: string;
  composer: string;
  lyricist: string;
  year: number;
  key: string;
  capo?: number;
  tempo?: number;
  time?: string;
  x_slug: string;
  x_pd_status: "public_domain" | "original" | "user_added";
  x_pd_basis?: string;
  x_translator?: string;
  x_translator_death_year?: number;
  x_source_url?: string;
};

export type Hymn = {
  metadata: HymnMetadata;
  chordpro: string;
};
