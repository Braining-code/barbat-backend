import fetch from "node-fetch";

export async function getTmviewResults(brand) {

  const url =
    "https://www.tmdn.org/tmview/api/search/trademark?" +
    new URLSearchParams({
      criteria: "C",
      basicSearch: brand,
      offices: "AR,WO",
      territories: "AR",
      page: 1,
      pageSize: 50
    });

  const headers = {
    "User-Agent":
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36",
    Accept: "application/json, text/plain, */*",
    Referer: "https://www.tmdn.org/tmview/",
    Origin: "https://www.tmdn.org"
  };

  const response = await fetch(url, { headers });

  // Si TMView no responde OK → error
  if (!response.ok) {
    return {
      ok: false,
      error: "TMView request failed",
      status: response.status
    };
  }

  const data = await response.json();

  const items = data?.items || [];

  return items.map((item) => ({
    name: item.name || null,
    classes: item.niceClasses || [],
    number: item.applicationNumber || null,
    applicant: item.applicant || null,
    representative: item.representative || null,
    status: item.status || null,
    office: item.office || null
  }));
}
