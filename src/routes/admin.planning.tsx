import { createFileRoute } from "@tanstack/react-router";
import { PageTitle } from "@/components/dash-shell";

const days = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi"];
const slots = ["09:00", "10:30", "13:30", "15:00"];
const events: Record<string, string> = {
  "Lundi-09:00": "Montessori MA",
  "Lundi-13:30": "Art-thérapie",
  "Mardi-10:30": "Lecture CP",
  "Mardi-15:00": "Sciences CE1",
  "Mercredi-09:00": "Yoga",
  "Jeudi-13:30": "Atelier Item 1",
  "Vendredi-10:30": "Nature",
  "Vendredi-15:00": "Réunion équipe",
};

export const Route = createFileRoute("/admin/planning")({
  head: () => ({ meta: [{ title: "Planning   Plateforme" }] }),
  component: () => (
    <div>
      <PageTitle eyebrow="Pédagogique" title="Planning de la semaine" />
      <div className="overflow-x-auto border border-zinc-200 bg-white [-webkit-overflow-scrolling:touch]">
        <table
          className="w-full min-w-[36rem] border-collapse text-left text-xs text-zinc-900"
          aria-label="Planning hebdomadaire par créneau"
        >
          <thead>
            <tr>
              <th
                scope="col"
                className="sticky left-0 z-10 w-[4.5rem] border border-zinc-200 bg-zinc-100 p-3 font-normal text-zinc-500 shadow-[1px_0_0_0_rgb(228_228_231)]"
              >
                <span className="sr-only">Créneau</span>
              </th>
              {days.map((d) => (
                <th
                  key={d}
                  scope="col"
                  className="border border-zinc-200 bg-zinc-100 p-3 text-center font-semibold text-zinc-900"
                >
                  {d}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {slots.map((s) => (
              <tr key={s}>
                <th
                  scope="row"
                  className="sticky left-0 z-10 whitespace-nowrap border border-zinc-200 bg-white p-3 text-right font-medium text-zinc-600 shadow-[1px_0_0_0_rgb(228_228_231)]"
                >
                  {s}
                </th>
                {days.map((d) => {
                  const label = events[`${d}-${s}`];
                  return (
                    <td
                      key={`${d}-${s}`}
                      className="min-h-16 border border-zinc-200 bg-white p-2 align-top text-zinc-900"
                    >
                      {label ? (
                        <div className="border border-zinc-300 bg-zinc-100 px-2 py-1.5 text-zinc-900">{label}</div>
                      ) : null}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  ),
});
