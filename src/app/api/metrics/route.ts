import { NextResponse } from "next/server";

export const revalidate = 43200; // Revalidate every 12 hours (auto-updates daily)

interface PackageStats {
  weekly: number;
  total: number;
  clones: number;
  uniques: number;
}

export async function GET() {
  const today = new Date().toISOString().split("T")[0];
  const ghToken = process.env.GITHUB_TOKEN;

  // Baseline fallbacks in case of registry/GitHub network hiccups
  const fallbacks: Record<string, PackageStats> = {
    "zakat-mal": { weekly: 267, total: 1211, clones: 319, uniques: 118 },
    "pethertz": { weekly: 606, total: 606, clones: 267, uniques: 115 },
    "smuggle-shield": { weekly: 476, total: 476, clones: 50, uniques: 23 },
    "dualtrust": { weekly: 743, total: 785, clones: 817, uniques: 302 },
    "corvin": { weekly: 15, total: 753, clones: 115, uniques: 62 },
    "capybala": { weekly: 109, total: 310, clones: 834, uniques: 272 },
  };

  const repoMap: Record<string, string> = {
    "zakat-mal": "codesbykhairannoor/zakat-mal",
    "pethertz": "codesbykhairannoor/pethertz",
    "smuggle-shield": "codesbykhairannoor/smuggle-shield",
    "dualtrust": "codesbykhairannoor/dual-trust",
    "corvin": "codesbykhairannoor/corvin",
    "capybala": "codesbykhairannoor/capybala",
  };

  const stats: Record<string, PackageStats> = { ...fallbacks };

  // 1. Fetch NPM Downloads
  const npmPkgs = ["zakat-mal", "pethertz", "smuggle-shield"];
  await Promise.all(
    npmPkgs.map(async (pkg) => {
      try {
        const [resWeek, resTotal] = await Promise.all([
          fetch(`https://api.npmjs.org/downloads/point/last-week/${pkg}`, {
            next: { revalidate: 43200 },
          }),
          fetch(`https://api.npmjs.org/downloads/point/2024-01-01:${today}/${pkg}`, {
            next: { revalidate: 43200 },
          }),
        ]);

        if (resWeek.ok) {
          const dataWeek = await resWeek.json();
          if (typeof dataWeek.downloads === "number") {
            stats[pkg].weekly = dataWeek.downloads;
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

  // 2. Fetch PyPI Downloads
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
          const lastWeek = dataRecent?.data?.last_week;
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

  // 3. Fetch GitHub Repository Clones (if GITHUB_TOKEN is available)
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
          }
        } catch (err) {
          // Fallback already assigned
        }
      })
    );
  }

  // Compute Grand Totals
  const totalDownloads = Object.values(stats).reduce((acc, curr) => acc + curr.total, 0);
  const weeklyDownloads = Object.values(stats).reduce((acc, curr) => acc + curr.weekly, 0);
  const totalClones = Object.values(stats).reduce((acc, curr) => acc + curr.clones, 0);
  const totalUniqueClones = Object.values(stats).reduce((acc, curr) => acc + curr.uniques, 0);

  return NextResponse.json({
    updatedAt: today,
    summary: {
      totalDownloads,
      weeklyDownloads,
      totalClones,
      totalUniqueClones,
      packagesCount: 6,
      preprintsCount: 2,
    },
    packages: stats,
  });
}
