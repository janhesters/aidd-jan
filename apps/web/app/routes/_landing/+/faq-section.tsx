import { IconSearch, IconSearchOff } from "@tabler/icons-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@workspace/ui/components/accordion";
import {
  Empty,
  EmptyContent,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@workspace/ui/components/empty";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@workspace/ui/components/input-group";
import { cn } from "@workspace/ui/lib/utils";
import { useState } from "react";
import { useTranslation } from "react-i18next";

import { FullWidthDivider } from "./full-width-divider";

type Category = "all" | "features" | "general" | "gettingStarted" | "support";

const categories: Category[] = [
  "all",
  "general",
  "gettingStarted",
  "features",
  "support",
];

const faqItems = [
  { category: "general", key: "free" },
  { category: "general", key: "shopify" },
  { category: "general", key: "techStack" },
  { category: "gettingStarted", key: "getStarted" },
  { category: "gettingStarted", key: "customizable" },
  { category: "features", key: "authentication" },
  { category: "features", key: "database" },
  { category: "features", key: "testing" },
  { category: "support", key: "help" },
  { category: "support", key: "contributing" },
] as const;

export function FaqSection() {
  const { t } = useTranslation("landing");
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<Category>("all");

  const filtered = faqItems.filter((item) => {
    if (activeCategory !== "all" && item.category !== activeCategory) {
      return false;
    }
    if (search.trim()) {
      const query = search.toLowerCase();
      const question = t(`faq.items.${item.key}.question`).toLowerCase();
      const answer = t(`faq.items.${item.key}.answer`).toLowerCase();
      return question.includes(query) || answer.includes(query);
    }
    return true;
  });

  return (
    <section className="relative py-12">
      <FullWidthDivider className="-top-px" />

      <div className="space-y-8 px-4">
        <div className="space-y-2 text-center">
          <h2 className="text-foreground text-2xl font-medium md:text-3xl">
            {t("faq.title")}
          </h2>
          <p className="text-muted-foreground text-sm text-balance">
            {t("faq.subtitle")}{" "}
            <a className="text-primary hover:underline" href="#">
              {t("faq.contactUs")}
            </a>
          </p>
        </div>

        <InputGroup className="mx-auto max-w-sm">
          <InputGroupAddon>
            <IconSearch />
          </InputGroupAddon>
          <InputGroupInput
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t("faq.searchPlaceholder")}
            type="search"
            value={search}
          />
        </InputGroup>

        <div className="flex flex-wrap justify-center gap-2">
          {categories.map((category) => (
            <button
              className={cn(
                "rounded-full px-3 py-1 text-sm transition-colors",
                activeCategory === category
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:text-foreground",
              )}
              key={category}
              onClick={() => setActiveCategory(category)}
              type="button"
            >
              {t(`faq.categories.${category}`)}
            </button>
          ))}
        </div>

        {filtered.length > 0 ? (
          <Accordion multiple={false}>
            {filtered.map((item) => (
              <AccordionItem key={item.key} value={item.key}>
                <AccordionTrigger>
                  {t(`faq.items.${item.key}.question`)}
                </AccordionTrigger>
                <AccordionContent>
                  {t(`faq.items.${item.key}.answer`)}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        ) : (
          <Empty>
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <IconSearchOff />
              </EmptyMedia>
              <EmptyTitle>{t("faq.noResults")}</EmptyTitle>
            </EmptyHeader>
            <EmptyContent>
              <p className="text-muted-foreground text-sm">
                {t("faq.noResultsDescription")}
              </p>
            </EmptyContent>
          </Empty>
        )}
      </div>
    </section>
  );
}
