import { NextResponse } from "next/server";

export const revalidate = 43200; // Revalidate every 12 hours (auto-updates daily)

export interface PackageStats {
  weekly: number;
  total: number;
  dailyDownloads: number;
  yesterdayDownloads: number;
  clones: number;
  uniques: number;
  dailyClones: number;
  yesterdayClones: number;
  dailyUniques: number;
}

export async function GET() {
  const today = new Date().toISOString().split("T")[0];
  const ghToken = process.env.GITHUB_TOKEN;

  // Baseline fallbacks in case of registry/GitHub network hiccups
  const fallbacks: Record<string, PackageStats> = {
    "zakat-mal": {
      weekly: 267,
      total: 1211,
      dailyDownloads: 4,
      yesterdayDownloads: 2,
      clones: 242,
      uniques: 89,
      dailyClones: 3,
      yesterdayClones: 4,
      dailyUniques: 2,
    },
    "pethertz": {
      weekly: 606,
      total: 606,
      dailyDownloads: 42,
      yesterdayDownloads: 25,
      clones: 272,
      uniques: 120,
      dailyClones: 4,
      yesterdayClones: 1,
      dailyUniques: 4,
    },
    "smuggle-shield": {
      weekly: 476,
      total: 476,
      dailyDownloads: 18,
      yesterdayDownloads: 14,
      clones: 53,
      uniques: 25,
      dailyClones: 1,
      yesterdayClones: 2,
      dailyUniques: 1,
    },
    "dualtrust": {
      weekly: 743,
      total: 785,
      dailyDownloads: 6,
      yesterdayDownloads: 12,
      clones: 835,
      uniques: 315,
      dailyClones: 6,
      yesterdayClones: 12,
      dailyUniques: 3,
    },
    "corvin": {
      weekly: 888,
      total: 888,
      dailyDownloads: 103,
      yesterdayDownloads: 75,
      clones: 191,
      uniques: 101,
      dailyClones: 33,
      yesterdayClones: 43,
      dailyUniques: 19,
    },
    "capybala": {
      weekly: 324,
      total: 324,
      dailyDownloads: 3,
      yesterdayDownloads: 15,
      clones: 893,
      uniques: 292,
      dailyClones: 11,
      yesterdayClones: 48,
      dailyUniques: 7,
    },
  };

  const repoMap: Record<string, string> = {
    "zakat-mal": "codesbykhairannoor/zakat-mal",
    "pethertz": "codesbykhairannoor/pethertz",
    "smuggle-shield": "codesbykhairannoor/smuggle-shield",
    "dualtrust": "codesbykhairannoor/dual-trust",
    "corvin": "codesbykhairannoor/corvin",
    "capybala": "codesbykhairannoor/capybala",
  };

  const stats: Record<string, PackageStats> = Object.fromEntries(
    Object.entries(fallbacks).map(([k, v]) => [k, { ...v }])
  );

  // 1. Fetch NPM Downloads (Daily Range & Total)
  const npmPkgs = ["zakat-mal", "pethertz", "smuggle-shield"];
  await Promise.all(
    npmPkgs.map(async (pkg) => {
      try {
        const [resRange, resTotal] = await Promise.all([
          fetch(`https://api.npmjs.org/downloads/range/last-week/${pkg}`, {
            next: { revalidate: 43200 },
          }),
          fetch(`https://api.npmjs.org/downloads/point/2024-01-01:${today}/${pkg}`, {
            next: { revalidate: 43200 },
          }),
        ]);

        if (resRange.ok) {
          const dataRange = await resRange.json();
          const days = dataRange?.downloads;
          if (Array.isArray(days) && days.length > 0) {
            const last = days[days.length - 1];
            const prev = days[days.length - 2];
            if (typeof last?.downloads === "number") {
              stats[pkg].dailyDownloads = last.downloads;
            }
            if (typeof prev?.downloads === "number") {
              stats[pkg].yesterdayDownloads = prev.downloads;
            }
            const weeklySum = days.reduce((sum: number, d: any) => sum + (d.downloads || 0), 0);
            if (weeklySum > 0) {
              stats[pkg].weekly = weeklySum;
            }
          }
        }

        if (resTotal.ok) {
          const dataTotal = await resTotal.json();
          if (typeof dataTotal.downloads === "number") {
            stats[pkg].total = dataTotal.downloads;
          }
        }
      } catch (err) {
        // Fallback already assigned
      }
    })
  );

  // 2. Fetch PyPI Downloads (Recent Daily & Overall)
  const pypiPkgs = ["dualtrust", "corvin", "capybala"];
  await Promise.all(
    pypiPkgs.map(async (pkg) => {
      try {
        const [resRecent, resOverall] = await Promise.all([
          fetch(`https://pypistats.org/api/packages/${pkg}/recent`, {
            next: { revalidate: 43200 },
          }),
          fetch(`https://pypistats.org/api/packages/${pkg}/overall`, {
            next: { revalidate: 43200 },
          }),
        ]);

        if (resRecent.ok) {
          const dataRecent = await resRecent.json();
          const lastDay = dataRecent?.data?.last_day;
          const lastWeek = dataRecent?.data?.last_week;
          if (typeof lastDay === "number") {
            stats[pkg].dailyDownloads = lastDay;
          }
          if (typeof lastWeek === "number") {
            stats[pkg].weekly = lastWeek;
          }
        }

        if (resOverall.ok) {
          const dataOverall = await resOverall.json();
          const items = dataOverall?.data;
          if (Array.isArray(items)) {
            const sumWithoutMirrors = items
              .filter((it: any) => it.category === "without_mirrors")
              .reduce((acc: number, it: any) => acc + (it.downloads || 0), 0);
            if (sumWithoutMirrors > 0) {
              stats[pkg].total = sumWithoutMirrors;
            }
          }
        }
      } catch (err) {
        // Fallback already assigned
      }
    })
  );

  // 3. Fetch GitHub Repository Clones (Daily & Total)
  if (ghToken) {
    await Promise.all(
      Object.entries(repoMap).map(async ([pkg, repo]) => {
        try {
          const res = await fetch(`https://api.github.com/repos/${repo}/traffic/clones`, {
            headers: {
              Authorization: `Bearer ${ghToken}`,
              Accept: "application/vnd.github+json",
              "User-Agent": "Khairan-Portfolio-Metrics",
            },
            next: { revalidate: 43200 },
          });

          if (res.ok) {
            const data = await res.json();
            if (typeof data.count === "number") {
              stats[pkg].clones = data.count;
            }
            if (typeof data.uniques === "number") {
              stats[pkg].uniques = data.uniques;
            }
            const clones = data.clones;
            if (Array.isArray(clones) && clones.length > 0) {
              const last = clones[clones.length - 1];
              const prev = clones[clones.length - 2];
              if (typeof last?.count === "number") {
                stats[pkg].dailyClones = last.count;
              }
              if (typeof last?.uniques === "number") {
                stats[pkg].dailyUniques = last.uniques;
              }
              if (typeof prev?.count === "number") {
                stats[pkg].yesterdayClones = prev.count;
              }
            }
          }
        } catch (err) {
          // Fallback already assigned
        }
      })
    );
  }

  // Compute Grand Totals & Daily Growth
  const totalDownloads = Object.values(stats).reduce((acc, curr) => acc + curr.total, 0);
  const weeklyDownloads = Object.values(stats).reduce((acc, curr) => acc + curr.weekly, 0);
  const todayDownloads = Object.values(stats).reduce((acc, curr) => acc + (curr.dailyDownloads || 0), 0);
  const yesterdayDownloads = Object.values(stats).reduce((acc, curr) => acc + (curr.yesterdayDownloads || 0), 0);

  const totalClones = Object.values(stats).reduce((acc, curr) => acc + curr.clones, 0);
  const totalUniqueClones = Object.values(stats).reduce((acc, curr) => acc + curr.uniques, 0);
  const todayClones = Object.values(stats).reduce((acc, curr) => acc + (curr.dailyClones || 0), 0);
  const yesterdayClones = Object.values(stats).reduce((acc, curr) => acc + (curr.yesterdayClones || 0), 0);

  return NextResponse.json({
    updatedAt: today,
    summary: {
      totalDownloads,
      weeklyDownloads,
      todayDownloads,
      yesterdayDownloads,
      totalClones,
      totalUniqueClones,
      todayClones,
      yesterdayClones,
      packagesCount: 6,
      preprintsCount: 2,
    },
    packages: stats,
  });
}
