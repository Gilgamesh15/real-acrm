import type { SQL } from "drizzle-orm";
import { AnimatePresence, motion } from "framer-motion";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronsRightIcon,
} from "lucide-react";
import React from "react";

import { Button } from "~/components/ui/button";
import Image from "~/components/ui/image";

import type { DBQueryResult } from "~/lib/types";
import { getChildren, getIsLeaf, getSlugPath } from "~/lib/utils";

function MobileSidebarCategories({
  categories,
  onNavigate,
}: {
  categories: DBQueryResult<
    "categories",
    { with: { image: true }; extras: { piecesCount: SQL.Aliased<number> } }
  >[];
  onNavigate: (href: string) => void;
}) {
  const [selectedCategory, setSelectedCategory] = React.useState<string | null>(
    null
  );

  const current = React.useMemo(() => {
    return categories.find((category) => category.id === selectedCategory);
  }, [categories, selectedCategory]);

  const children = React.useMemo(() => {
    return getChildren(categories, selectedCategory);
  }, [categories, selectedCategory]);

  const handleSelectCategory = (
    category: DBQueryResult<
      "categories",
      { with: { image: true }; extras: { piecesCount: SQL.Aliased<number> } }
    >
  ) => {
    if (getIsLeaf(categories, category.id)) {
      onNavigate(`/kategorie/${getSlugPath(category)}`);
    } else {
      setSelectedCategory(category.id);
    }
  };

  return (
    <div className="divide-y overflow-hidden">
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={selectedCategory ?? "root"}
          initial={{ x: "-100%", opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: "100%", opacity: 0 }}
          transition={{ duration: 0.2, ease: [0, 0, 1, 1] }}
          className="divide-y"
        >
          {current && (
            <Button
              variant="ghost"
              size="lg"
              className="w-full justify-start h-14 relative font-secondary text-xl tracking-wide"
              onClick={() => {
                const parent = categories.find(
                  (category) => category.id === current.parentId
                );
                if (parent) {
                  setSelectedCategory(parent.id);
                } else {
                  setSelectedCategory(null);
                }
              }}
            >
              <ChevronLeftIcon className="size-4 relative z-20" />
              <span className="relative z-20 text-sm">Powrót</span>
            </Button>
          )}
          {current && (
            <Button
              variant="ghost"
              size="lg"
              className="w-full justify-start h-14 relative font-secondary text-xl tracking-wide"
              onClick={() => onNavigate(`/kategorie/${getSlugPath(current)}`)}
            >
              <Image
                src={current.image?.url ?? ""}
                alt={current.name}
                width={319}
                height={54}
                resize="fill"
                className="absolute inset-0 size-full z-0"
              />
              <div className="absolute inset-0 bg-linear-to-l from-background/90 via-background/40 to-background/90 z-10" />
              <span className="relative z-20">{current.name}</span>
              <span className="font-primary text-xs font-medium ml-auto relative z-20">
                Zobacz wszystkie
              </span>
              <ChevronsRightIcon className="size-4 relative z-20" />
            </Button>
          )}
          {children.map((category) => {
            const isLeaf = getIsLeaf(categories, category.id);

            return (
              <Button
                variant="ghost"
                size="lg"
                key={category.id}
                className="w-full justify-start h-14 relative font-secondary text-xl tracking-wide"
                onClick={() => handleSelectCategory(category)}
              >
                <Image
                  src={category.image?.url ?? ""}
                  alt={category.name}
                  width={319}
                  height={54}
                  resize="fill"
                  className="absolute inset-0 size-full z-0"
                />
                <div className="absolute inset-0 bg-linear-to-l from-background/90 via-background/40 to-background/90 z-10" />
                <span className="relative z-20">
                  {category.name}{" "}
                  {isLeaf && (
                    <span className="text-sm font-mono font-medium ml-auto relative z-20">
                      ({category.piecesCount})
                    </span>
                  )}
                </span>
                <ChevronRightIcon className="size-4 ml-auto relative z-20" />
              </Button>
            );
          })}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

export { MobileSidebarCategories };
