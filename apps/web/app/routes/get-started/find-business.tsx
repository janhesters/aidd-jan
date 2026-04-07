import { Button } from "@workspace/ui/components/button";
import { Card, CardContent, CardFooter } from "@workspace/ui/components/card";
import { FieldError } from "@workspace/ui/components/field";
import { Input } from "@workspace/ui/components/input";
import { cn } from "@workspace/ui/lib/utils";
import {
  CheckCircleIcon,
  ClockIcon,
  MapPinIcon,
  SearchIcon,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Form, useFetcher, useNavigation } from "react-router";
import * as z from "zod";

import { useForm } from "~/lib/conform";
import { validateFormData } from "~/lib/validate-form-data";
import { getInstance } from "~/middleware/i18next";

import type { Route } from "./+types/find-business";

const schema = z.object({
  placeId: z
    .string({ error: "getStarted:findBusiness.errors.placeRequired" })
    .min(1, "getStarted:findBusiness.errors.placeRequired"),
});

export async function loader({ context }: Route.LoaderArgs) {
  const t = getInstance(context).getFixedT(null, "getStarted", "findBusiness");
  return { title: t("meta.title") };
}

export function meta({ data }: Route.MetaArgs) {
  return [{ title: data?.title }];
}

export async function action({ request }: Route.ActionArgs) {
  const result = await validateFormData(request, schema);

  if (!result.success) {
    return result.response;
  }

  // TODO: Redirect to next onboarding step with the selected placeId
  return { result: null };
}

interface PlaceSuggestion {
  placeId: string;
  mainText: string;
  secondaryText: string;
}

export default function FindBusinessRoute({
  actionData,
}: Route.ComponentProps) {
  const { t } = useTranslation("getStarted", { keyPrefix: "findBusiness" });
  const { form, fields } = useForm(schema, {
    lastResult: actionData?.result,
  });
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";

  const fetcher = useFetcher<{
    suggestions: Array<PlaceSuggestion>;
  }>();
  const suggestions = fetcher.data?.suggestions ?? [];
  const isLoading = fetcher.state === "loading";

  const [query, setQuery] = useState("");
  const [selectedPlace, setSelectedPlace] = useState<PlaceSuggestion | null>(
    null,
  );
  const [isOpen, setIsOpen] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const value = e.target.value;
    setQuery(value);
    setSelectedPlace(null);

    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (value.length < 1) {
      setIsOpen(false);
      return;
    }

    debounceRef.current = setTimeout(() => {
      fetcher.load(
        `/api/places-autocomplete?input=${encodeURIComponent(value)}`,
      );
    }, 300);
  }

  useEffect(() => {
    if (suggestions.length > 0 && !selectedPlace) {
      setIsOpen(true);
    }
  }, [suggestions, selectedPlace]);

  function handleSelect(place: PlaceSuggestion) {
    setSelectedPlace(place);
    setQuery(place.mainText);
    setIsOpen(false);
  }

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <Card className="w-full max-w-4xl">
      <CardContent className="grid gap-8 md:grid-cols-2">
        {/* Left side — info */}
        <div className="flex flex-col justify-center gap-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              {t("title")} <span className="text-primary">{t("subtitle")}</span>
            </h1>
          </div>

          <ul className="space-y-4">
            <li className="flex items-start gap-3">
              <SearchIcon className="text-primary mt-0.5 h-5 w-5 shrink-0" />
              <span className="text-muted-foreground text-sm font-medium">
                <strong className="text-foreground">
                  {t("bullet1").split(" ").slice(0, 3).join(" ")}
                </strong>{" "}
                {t("bullet1").split(" ").slice(3).join(" ")}
              </span>
            </li>
            <li className="flex items-start gap-3">
              <MapPinIcon className="text-primary mt-0.5 h-5 w-5 shrink-0" />
              <span className="text-muted-foreground text-sm font-medium">
                {t("bullet2")}
              </span>
            </li>
            <li className="flex items-start gap-3">
              <ClockIcon className="text-primary mt-0.5 h-5 w-5 shrink-0" />
              <span className="text-muted-foreground text-sm font-medium">
                <strong className="text-foreground">{t("bullet3")}</strong>
              </span>
            </li>
          </ul>
        </div>

        {/* Right side — search */}
        <Form method="POST" {...form.props}>
          <div className="flex flex-col gap-4">
            <h2 className="text-center text-lg font-semibold">
              {t("searchHeading")}
            </h2>

            <div ref={containerRef} className="relative">
              <div className="relative">
                <SearchIcon className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
                <Input
                  autoComplete="off"
                  className="h-12 rounded-xl pl-10 text-base"
                  onChange={handleInputChange}
                  placeholder={t("searchPlaceholder")}
                  type="text"
                  value={query}
                />
              </div>

              {isOpen && suggestions.length > 0 && (
                <div className="bg-popover ring-border absolute top-full z-10 mt-1 w-full overflow-hidden rounded-xl ring-1">
                  <ul className="py-1">
                    {suggestions.map((suggestion) => (
                      <li key={suggestion.placeId}>
                        <button
                          className={cn(
                            "hover:bg-accent flex w-full items-start gap-3 px-4 py-3 text-left transition-colors",
                            selectedPlace?.placeId === suggestion.placeId &&
                              "bg-accent",
                          )}
                          onClick={() => handleSelect(suggestion)}
                          type="button"
                        >
                          <MapPinIcon className="text-muted-foreground mt-0.5 h-4 w-4 shrink-0" />
                          <div className="min-w-0">
                            <span className="font-medium">
                              {suggestion.mainText}
                            </span>{" "}
                            <span className="text-muted-foreground text-sm">
                              {suggestion.secondaryText}
                            </span>
                          </div>
                        </button>
                      </li>
                    ))}
                  </ul>
                  <div className="text-muted-foreground border-t px-4 py-2 text-right text-xs">
                    {t("poweredByGoogle")}
                  </div>
                </div>
              )}
            </div>

            <FieldError
              errors={fields.placeId.errors}
              id={fields.placeId.errorId}
            />

            <input
              {...fields.placeId.inputProps}
              type="hidden"
              value={selectedPlace?.placeId ?? ""}
            />

            <Button
              className="h-12 rounded-xl text-base"
              disabled={!selectedPlace || isLoading || isSubmitting}
              size="lg"
              type="submit"
            >
              {t("continueButton")} &rarr;
            </Button>

            <button
              className="text-muted-foreground hover:text-foreground text-sm underline transition-colors"
              type="button"
            >
              {t("websiteAlternative")}
            </button>
          </div>
        </Form>
      </CardContent>

      <CardFooter className="justify-center">
        <div className="flex items-center gap-2">
          <CheckCircleIcon className="text-primary h-5 w-5" />
          <span className="text-muted-foreground text-sm">
            {t("trialNotice")}
          </span>
        </div>
      </CardFooter>
    </Card>
  );
}
