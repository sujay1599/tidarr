import React, { useContext, useState, ReactNode, useEffect } from "react";

import {
  TidalArtistModuleType,
  TidalArtistResponseType,
  TidalResponseType,
} from "../types";
import { useSearchParams } from "next/navigation";
import { fetchTidal } from "../utils/fetch";

type SearchContextType = {
  searchResults: TidalResponseType;
  artistResults: TidalArtistModuleType[];
  keywords: string | undefined;
  loading: boolean;
  page: number;
  itemPerPage: number;
  actions: {
    performSearch: any;
    setPage: (page: number) => void;
    queryTidal: (query: string, page: number) => void;
    queryArtist: (id: number, name: string, page: number) => void;
  };
};

const SearchContext = React.createContext<SearchContextType>(
  {} as SearchContextType
);

export function SearchProvider({ children }: { children: ReactNode }) {
  const itemPerPage = 12;

  const [loading, setLoading] = useState<boolean>(false);
  const [page, setPage] = useState<number>(1);
  const [keywords, setKeywords] = useState<string>();
  const [searchResults, setSearchResults] = useState<TidalResponseType>(
    {} as TidalResponseType
  );
  const [artistResults, setArtistResults] = useState<TidalArtistModuleType[]>(
    [] as TidalArtistModuleType[]
  );

  const params = useSearchParams();

  function performSearch(e: any) {
    e.preventDefault();
    const searchString = e?.target?.[0]?.value as string;
    fetchData(searchString, 1);
    setArtistResults([]);
  }

  function fetchData(searchString: string, page: number = 1) {
    if (searchString.substring(0, 4) === "http") {
      directDownload(searchString);
    } else if (searchString.split(":").length > 2) {
      queryArtist(
        parseInt(searchString.split(":")[1]),
        searchString.split(":")[2],
        page
      );
    } else {
      queryTidal(searchString, page);
    }
  }

  async function queryTidal(query: string, page: number = 1) {
    setLoading(true);
    const results = await fetchTidal<TidalResponseType>(
      `https://listen.tidal.com/v1/search/top-hits?query=${query}&limit=${itemPerPage}&offset=${
        (page - 1) * itemPerPage
      }`
    );

    const clone = { ...searchResults };
    const data = {
      albums: {
        ...results?.albums,
        items: [
          ...(page > 1 ? clone?.albums?.items || [] : []),
          ...results?.albums?.items,
        ],
      },
      artists: {
        ...results?.artists,
        items: [
          ...(page > 1 ? clone?.artists?.items || [] : []),
          ...results?.artists?.items,
        ],
      },
      tracks: {
        ...results?.tracks,
        items: [
          ...(page > 1 ? clone?.tracks?.items || [] : []),
          ...results?.tracks?.items,
        ],
      },
    };
    setSearchResults(data);
    postFetch(query);
  }

  async function queryArtist(id: number, name: string, page: number = 1) {
    setLoading(true);
    const data_artist = await fetchTidal<TidalArtistResponseType>(
      `https://listen.tidal.com/v1/pages/artist?artistId=${id}&deviceType=BROWSER`
    );

    if (data_artist?.rows?.length > 0) {
      const album_block = data_artist?.rows
        .filter(
          (row) =>
            row.modules.filter((module) => module.type === "ALBUM_LIST")
              .length > 0
        )
        .map((row) => row.modules[0]);
      setArtistResults(album_block);
    }

    postFetch(`artist:${id}:${data_artist.title}`);
  }

  async function directDownload(url: string) {
    const id = url.substring(url.lastIndexOf("/") + 1, url.length);
    const splittedUrl = url.split("/");
    const type = splittedUrl[splittedUrl?.length - 2];

    if (type === "artist") {
      queryArtist(parseInt(id), "", 1);
    }
    if (type === "album") {
      setLoading(true);
      const data_album = await fetchTidal<TidalArtistResponseType>(
        `https://listen.tidal.com/v1/pages/album?albumId=${id}&deviceType=BROWSER`
      );

      const data: any = {
        albums: {
          items: [data_album.rows[0].modules[0].album],
          totalNumberOfItems: 1,
        },
        artists: { items: [], totalNumberOfItems: 0 },
        tracks: { items: [], totalNumberOfItems: 0 },
      };
      setSearchResults(data);
      postFetch(url);
    }
  }

  function postFetch(searchString: string, page: number = 1) {
    if (document.getElementById("filled-basic")) {
      (document.getElementById("filled-basic") as HTMLInputElement).value =
        searchString;
    }

    setKeywords(searchString);
    setPage(page);
    setLoading(false);
    history.pushState({}, "pushState search", `/?query=${searchString}`);
  }

  // Fetch on page change
  useEffect(() => {
    if (keywords) queryTidal(keywords, page);
  }, [page]);

  // If url query exists on load
  useEffect(() => {
    const query = params.get("query");
    if (query) fetchData(query, 1);
  }, [params]);

  const value = {
    searchResults,
    artistResults,
    loading,
    keywords,
    itemPerPage,
    page,
    actions: {
      performSearch,
      setPage,
      queryTidal,
      queryArtist,
    },
  };

  return (
    <SearchContext.Provider value={value}>{children}</SearchContext.Provider>
  );
}

export const useSearchProvider = () => {
  return useContext(SearchContext);
};
