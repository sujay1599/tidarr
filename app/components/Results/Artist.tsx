import * as React from "react";
import Card from "@mui/material/Card";
import CardMedia from "@mui/material/CardMedia";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import DownloadIcon from "@mui/icons-material/Download";
import SearchIcon from "@mui/icons-material/DiscFullRounded";
import { ArtistType } from "@/app/types";
import { Avatar, Box, Button, Chip, Link, Stack } from "@mui/material";
import { useTidalProvider } from "@/app/provider/TidalProvider";
import { GetServerSidePropsContext } from "next";
import { useRouter } from "next/navigation";

export default function Artist({
  artist,
  setTabIndex,
}: {
  artist: ArtistType;
  setTabIndex: Function;
}) {
  const { actions } = useTidalProvider();
  const [processed, setProcessed] = React.useState<boolean>();
  const [error, setError] = React.useState<boolean>();
  const router = useRouter();

  const downloadItem = async (url: string) => {
    const {save} = await actions.save(url);

    if (save) {
      setProcessed(true);
      setError(false);
    } else {
      setProcessed(false);
      setError(true);
    }
  }  

  return (
    <Card sx={{ display: "flex" }}>
      <CardContent>
        <Avatar
          alt={artist.name}
          sx={{ width: 100, height: 100 }}
          src={`https://resources.tidal.com/images/${artist?.picture?.replace(
            /-/g,
            "/"
          )}/750x750.jpg`}
        />
      </CardContent>
      <Box sx={{ display: "flex", flexDirection: "column", flex: "1 1 0" }}>
        <CardContent sx={{ flex: "0 0 auto", padding: "1rem" }}>
          <Stack
            direction="row"
            flexWrap="wrap"
            spacing={1}
            alignItems="center"
          >
            <Link
              href={artist.url}
              style={{ flex: "1 1 0" }}
              target="_blank"
              underline="none"
            >
              <Typography component="span">
                <strong>{artist.name}</strong>
              </Typography>
            </Link>
          </Stack>
          <Stack direction="row" spacing={1} sx={{ py: 1.5 }}>
            <Chip
              label={`Popularity: ${artist.popularity}`}
              variant="outlined"
              size="small"
              color={
                artist.popularity > 75
                  ? "success"
                  : artist.popularity > 33
                  ? "warning"
                  : "error"
              }
            />
          </Stack>
          <Stack direction="row" flexWrap="wrap" spacing={1}>
            <Button
              variant="outlined"
              endIcon={<SearchIcon />}
              onClick={() => {
                router.push(`/?query=${artist.name}`);
                setTabIndex(0);
              }}
              size="small"
            >
              Search albums
            </Button>
            <Button
              variant="outlined"
              disabled={processed}
              endIcon={<DownloadIcon />}
              onClick={() => downloadItem(artist.url)}
              size="small"
            >
              {processed ? "Downloading ..." : error ? "Error !"  : "Get all"}
            </Button>
          </Stack>
        </CardContent>
      </Box>
    </Card>
  );
}

export const getServerSideProps = (context: GetServerSidePropsContext) => {
  console.log("client", context);
  return { save: true };
};