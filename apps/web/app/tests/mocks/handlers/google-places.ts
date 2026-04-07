import type { HttpHandler } from "msw";
import { HttpResponse, http } from "msw";

const MOCK_BUSINESSES = [
  {
    address: "123 Main Street, Springfield, IL, USA",
    name: "Springfield Coffee House",
  },
  {
    address: "456 Oak Avenue, Springfield, IL, USA",
    name: "Springfield Auto Repair",
  },
  {
    address: "789 Elm Drive, Shelbyville, IL, USA",
    name: "Shelbyville Bakery & Cafe",
  },
  {
    address: "321 Pine Road, Capital City, IL, USA",
    name: "Capital City Fitness Center",
  },
  {
    address: "654 Maple Lane, Ogdenville, IL, USA",
    name: "Ogdenville Pet Grooming",
  },
];

export const googlePlacesHandlers: Array<HttpHandler> = [
  http.post(
    "https://places.googleapis.com/v1/places:autocomplete",
    async ({ request }) => {
      const body = (await request.json()) as { input?: string };
      const input = (body.input ?? "").toLowerCase();

      if (input.length < 1) {
        return HttpResponse.json({ suggestions: [] });
      }

      const filtered = MOCK_BUSINESSES.filter(
        (b) =>
          b.name.toLowerCase().includes(input) ||
          b.address.toLowerCase().includes(input),
      );

      const suggestions = (filtered.length > 0 ? filtered : MOCK_BUSINESSES)
        .slice(0, 5)
        .map((business, index) => ({
          placePrediction: {
            placeId: `mock-place-id-${index + 1}`,
            structuredFormat: {
              mainText: { text: business.name },
              secondaryText: { text: business.address },
            },
          },
        }));

      console.info("🔶 mocked Google Places autocomplete:", input);

      return HttpResponse.json({ suggestions });
    },
  ),
];
