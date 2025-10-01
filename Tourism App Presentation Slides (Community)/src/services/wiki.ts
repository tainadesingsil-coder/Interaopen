// Fetch a representative image from Wikimedia for a given place name and city
export async function fetchWikimediaImage(title: string, city: string, signal?: AbortSignal): Promise<string | undefined> {
  try {
    const sr = await fetch(
      `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(`${title} ${city} Minas Gerais`)}&format=json&origin=*`,
      { signal }
    );
    const srj = await sr.json();
    const pageId = srj?.query?.search?.[0]?.pageid;
    if (!pageId) return undefined;
    const imgRes = await fetch(
      `https://en.wikipedia.org/w/api.php?action=query&pageids=${pageId}&prop=pageimages&pithumbsize=800&format=json&origin=*`,
      { signal }
    );
    const imgJson = await imgRes.json();
    const pages = imgJson?.query?.pages;
    const page = pages ? pages[Object.keys(pages)[0]] : undefined;
    const src = page?.thumbnail?.source;
    return src as string | undefined;
  } catch {
    return undefined;
  }
}

