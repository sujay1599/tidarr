
export type TrackType = {
  album: {
    cover: string;
    url: string;
    id: string;
    releaseDate: string;
    title: string;
  };
  artists: {
    id: number;
    name: string;
    picture: string;
    type: string;
  }[];
  duration: number;
  audioQuality: string;
  releaseDate: string;
  title: string;
  id: number;
  url: string;
};

export type ArtistType = {
  artistRoles: string[];
  artistTypes: string[];
  id: number;
  name: string;
  picture: string;
  url: string;
  popularity: number;
};

export type AlbumType = {
  artists: {
    id: number;
    name: string;
    picture: string;
    type: string;
  }[],
  cover: string;
  duration: number;
  audioQuality: string;
  numberOfTracks: number;
  releaseDate: string;
  title: string;
  type: string;
  id: number;
  popularity: number;
  url: string;
}

export type TidalResponseFormat<T> = {
  items: T[];
  limit: number;
  offset: number;
  totalNumberOfItems: number;
};

export type TidalResponseType = {
  albums: TidalResponseFormat<AlbumType>;
  tracks: TidalResponseFormat<TrackType>;
  artists: TidalResponseFormat<ArtistType>;
};