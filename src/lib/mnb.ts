const MNB_ENDPOINT = "https://www.mnb.hu/arfolyamok.asmx";
const MNB_SOAP_ACTION =
  "http://www.mnb.hu/webservices/MNBArfolyamServiceSoap/GetCurrentExchangeRates";

const SOAP_ENVELOPE = `<?xml version="1.0" encoding="utf-8"?>
<soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
  <soap:Body>
    <GetCurrentExchangeRates xmlns="http://www.mnb.hu/webservices/" />
  </soap:Body>
</soap:Envelope>`;

/**
 * Fetches the current EUR/HUF middle rate from the MNB (Hungarian National
 * Bank) SOAP exchange-rate service. Throws with a Hungarian, user-facing
 * message on any failure — the site this runs from may be blocked by MNB's
 * WAF (observed returning a bare 404 to server-to-server POSTs during
 * development), so callers should let the admin fall back to typing the
 * rate in manually rather than treating this as unconditionally reliable.
 */
export async function fetchMnbEurHufRate(): Promise<number> {
  let res: Response;
  try {
    res = await fetch(MNB_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "text/xml; charset=utf-8",
        SOAPAction: MNB_SOAP_ACTION,
      },
      body: SOAP_ENVELOPE,
      cache: "no-store",
    });
  } catch {
    throw new Error("Nem sikerült elérni az MNB szolgáltatását.");
  }

  if (!res.ok) {
    throw new Error(`Az MNB szolgáltatása ${res.status} hibát adott vissza.`);
  }

  const body = await res.text();
  // GetCurrentExchangeRatesResult is an XML-escaped XML string nested
  // inside the SOAP body — a targeted regex is simpler and more robust
  // here than parsing twice with a full XML parser.
  const match = body.match(/curr=&quot;EUR&quot;&gt;([\d.,]+)&lt;/) ?? body.match(/curr="EUR">([\d.,]+)</);
  if (!match) {
    throw new Error("Az MNB válaszában nem található EUR árfolyam.");
  }

  const rate = Number(match[1].replace(",", "."));
  if (!Number.isFinite(rate) || rate <= 0) {
    throw new Error("Az MNB válasza értelmezhetetlen árfolyamot tartalmazott.");
  }
  return rate;
}
