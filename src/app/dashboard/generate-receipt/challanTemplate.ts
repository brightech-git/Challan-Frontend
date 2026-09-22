// Shared helper for the AUTHFORM / DELIVERYFORM templates fetched from the
// ChallanFormat API. Both are full standalone HTML documents whose scripts
// declare `const <varName> = loadDataFromUrl();` and read everything else
// off that object; `loadDataFromUrl()` itself falls back to reading a
// `?data=<json>` query string, which is also what their built-in "Build a
// link with your own values" tool produces.
//
// We render these documents in a `srcDoc` iframe, which has no real URL to
// carry a query string, so instead of faking `window.location.search` we
// splice our own JSON straight into the `<varName> = ...` assignment.
export function injectTemplateData(
  html: string,
  jsonData: unknown,
  options: { varName: string; logoClass?: string }
): string {
  const json = JSON.stringify(jsonData);
  const { varName, logoClass } = options;

  let out = html.replace(
    /<\/head>/i,
    "<style>.no-print{display:none!important;}</style></head>"
  );

  if (logoClass) {
    // The template's logo <img> points at a bare relative filename (e.g.
    // "icon.png"), which can't resolve inside a srcDoc iframe. Force it to
    // our own local /icon.png instead of whatever the template ships with.
    const logoRegex = new RegExp(
      `<img\\b[^>]*\\bclass="[^"]*${logoClass}[^"]*"[^>]*>`,
      "i"
    );
    out = out.replace(logoRegex, (imgTag) =>
      imgTag.replace(/\bsrc="[^"]*"/i, 'src="/icon.png"')
    );
  }

  const assignRegex = new RegExp(
    `const\\s+${varName}\\s*=\\s*loadDataFromUrl\\(\\)\\s*;`
  );
  const withAssignment = out.replace(assignRegex, `const ${varName} = ${json};`);

  if (withAssignment !== out) {
    return withAssignment;
  }

  // Fallback in case the template no longer assigns the variable this way:
  // patch the `window.location.search` read directly instead.
  const search = "?data=" + encodeURIComponent(json);
  return out.replace(/window\.location\.search/g, JSON.stringify(search));
}
