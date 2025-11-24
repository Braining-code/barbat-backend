import fetch from "node-fetch";

export async function getTmviewResults(brand) {
  const url =
    "https://www.tmdn.org/tmview/api/search?" +
    new URLSearchParams({
      query: brand,
      rows: 50,
      start: 0,
      offices: "AR,WO",
      territories: "AR"
    });

  const headers = {
    "User-Agent":
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36",
    Accept: "application/json",
    Referer: "https://www.tmdn.org/tmview/",
    Origin: "https://www.tmdn.org"
  };

  const res = await fetch(url, { headers });

  if (!res.ok) {
    return {
      ok: false,
      error: "TMView request failed",
      status: res.status
    };
  }

  const data = await res.json();

  const items = data?.response?.docs || [];

  return items.map((item) => ({
    name: item.trademark || null,
    classes: item.nice ? item.nice.map(Number) : [],
    number: item.id || null,
    applicant: item.applicant || null,
    representative: item.representative || null,
    status: item.status || null,
    office: item.office || null
  }));
}
