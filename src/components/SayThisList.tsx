"use client";

import { useState } from "react";
import { GlossaryText } from "@/components/GlossaryText";
import type { SayThisItem } from "@/content/schema";
import { sayThisHasListenFor, sayThisListenFor, sayThisPrompt } from "@/lib/say-this";

export function SayThisList({ items }: { items: SayThisItem[] }) {
  const [showListenFor, setShowListenFor] = useState(false);
  const hasListenFor = sayThisHasListenFor(items);

  return (
    <div>
      {hasListenFor ? (
        <button
          type="button"
          onClick={() => setShowListenFor((value) => !value)}
          className="text-sm font-semibold text-sage underline decoration-sage/40 underline-offset-2"
        >
          {showListenFor ? "Hide what you might hear" : "Show what you might hear"}
        </button>
      ) : null}
      <ul className={`list-disc space-y-2 pl-5 text-ink ${hasListenFor ? "mt-3" : ""}`}>
        {items.map((item) => {
          const prompt = sayThisPrompt(item);
          const listenFor = sayThisListenFor(item);
          return (
            <li key={prompt}>
              <GlossaryText text={prompt} />
              {showListenFor && listenFor ? (
                <p className="mt-1 text-sm text-ink-soft">
                  <span className="font-semibold text-ink">Might sound like: </span>
                  <GlossaryText text={listenFor} />
                </p>
              ) : null}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
