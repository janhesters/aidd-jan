import type { Route } from "./+types/places-autocomplete";

const GOOGLE_PLACES_URL =
  "https://places.googleapis.com/v1/places:autocomplete";

interface GoogleAutocompleteSuggestion {
  placePrediction?: {
    placeId: string;
    structuredFormat?: {
      mainText?: { text: string };
      secondaryText?: { text: string };
    };
  };
}

interface GoogleAutocompleteResponse {
  suggestions?: Array<GoogleAutocompleteSuggestion>;
}

export async function loader({ request }: Route.LoaderArgs) {
  const url = new URL(request.url);
  const input = url.searchParams.get("input") ?? "";

  console.info("[places-autocomplete] input:", input, "length:", input.length);

  if (input.length < 1) {
    console.info("[places-autocomplete] input empty, skipping");
    return Response.json({ suggestions: [] });
  }

  const apiKey = process.env.GOOGLE_PLACES_API_KEY ?? "";
  console.info(
    "[places-autocomplete] fetching from Google, apiKey set:",
    !!apiKey,
  );

  const response = await fetch(GOOGLE_PLACES_URL, {
    body: JSON.stringify({
      includedPrimaryTypes: ["establishment"],
      input,
    }),
    headers: {
      "Content-Type": "application/json",
      "X-Goog-Api-Key": apiKey,
    },
    method: "POST",
  });

  console.info("[places-autocomplete] response status:", response.status);

  if (!response.ok) {
    const text = await response.text();
    console.info("[places-autocomplete] error response:", text);
    return Response.json({ suggestions: [] });
  }

  const data: GoogleAutocompleteResponse = await response.json();
  console.info(
    "[places-autocomplete] suggestions count:",
    data.suggestions?.length ?? 0,
  );

  const suggestions = (data.suggestions ?? [])
    .filter((s) => s.placePrediction)
    .map((s) => ({
      mainText: s.placePrediction!.structuredFormat?.mainText?.text ?? "",
      placeId: s.placePrediction!.placeId,
      secondaryText:
        s.placePrediction!.structuredFormat?.secondaryText?.text ?? "",
    }));

  return Response.json({ suggestions });
}
