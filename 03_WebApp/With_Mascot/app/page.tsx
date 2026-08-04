"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button, Card, Shell } from "@/components/ui";
import FutureMeMascot from "@/components/mascot/FutureMeMascot";
import { useT } from "@/components/PreferencesProvider";
import { format } from "@/lib/i18n";
import { formDefinition, type FormId } from "@/conversational_questionnaire/lib/forms";
import { saveFormId } from "@/conversational_questionnaire/lib/form-storage";

/**
 * The landing page.
 *
 * One job: introduce the Buddy and get the learner into the questionnaire with
 * a clear choice of length. Everything explanatory — the three steps, the
 * honest limitations — moved to /how-it-works, so the first screen is an
 * invitation rather than a briefing.
 *
 * The two lengths are shown side by side with their real question counts, read
 * from the form definitions rather than typed into the copy, so the numbers
 * cannot drift from the questionnaire the learner actually gets.
 */
export default function Home() {
  const t = useT();
  const router = useRouter();

  const short = formDefinition("short");
  const full = formDefinition("full");

  const begin = (id: FormId) => {
    saveFormId(id);
    router.push("/interview");
  };

  return (
    <Shell>
      <section className="mx-auto grid max-w-2xl justify-items-center gap-6 pt-6 text-center">
        <FutureMeMascot emotion="smile" pose="wave" size="xl" />

        <div className="grid gap-3">
          <h1 className="text-3xl font-bold leading-tight sm:text-4xl">{t.landing.introTitle}</h1>
          <p className="text-base text-muted">{t.landing.introBody}</p>
        </div>

        <h2 className="mt-2 text-xs font-bold uppercase tracking-widest text-muted">
          {t.landing.chooseLength}
        </h2>

        <div className="grid w-full gap-3 sm:grid-cols-2">
          <Card className="flex flex-col gap-2 text-left">
            <h3 className="text-base font-bold">{t.landing.shortTitle}</h3>
            <p className="text-xs font-semibold text-indigoText">
              {format(t.landing.shortMeta, { n: short.interestCount })}
            </p>
            <p className="flex-1 text-sm text-muted">{t.landing.shortBody}</p>
            <div className="pt-2">
              <Button onClick={() => begin("short")} variant="secondary" data-testid="start-short">
                {t.landing.startShort}
              </Button>
            </div>
          </Card>

          <Card className="flex flex-col gap-2 text-left">
            <h3 className="text-base font-bold">{t.landing.fullTitle}</h3>
            <p className="text-xs font-semibold text-indigoText">
              {format(t.landing.fullMeta, { n: full.interestCount })}
            </p>
            <p className="flex-1 text-sm text-muted">{t.landing.fullBody}</p>
            <div className="pt-2">
              <Button onClick={() => begin("full")} data-testid="start-guest">
                {t.landing.startFull}
              </Button>
            </div>
          </Card>
        </div>

        {/* Said here rather than only in a doc: choosing the short form is a
            trade-off the learner is making, so they should be told before they
            make it. */}
        <p className="max-w-xl text-xs text-muted">{t.landing.shortCaveat}</p>

        <p className="text-xs text-muted">{t.landing.noAccount}</p>

        <div className="flex flex-wrap justify-center gap-4 text-sm">
          <Link href="/how-it-works" className="text-mint underline underline-offset-2">
            {t.landing.howItWorks}
          </Link>
          <Link href="/privacy" className="text-mint underline underline-offset-2">
            {t.landing.whatHappens}
          </Link>
        </div>
      </section>
    </Shell>
  );
}
