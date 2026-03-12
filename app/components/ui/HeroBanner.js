'use client'

import Image from 'next/image'

export default function HeroBanner({ data }) {
  // Extract image data from the first item in each array (if available)
  const imageOne = data.heroImageOne && data.heroImageOne[0];
  const imageTwo = data.heroImageTwo && data.heroImageTwo[0];
  const imageThree = data.heroImageThree && data.heroImageThree[0];

  const bgImageOne = data.bgImageOne && data.bgImageOne[0];
  const bgImageTwo = data.bgImageTwo && data.bgImageTwo[0];
  const bgImageThree = data.bgImageThree && data.bgImageThree[0];

  // Get CMS base URL from environment variable or fallback
  const cmsBaseUrl = process.env.NEXT_PUBLIC_CMS_URL || 'https://cms-ccc.ddev.site/';

  // Construct full image URL
  const getFullImageUrl = (url) => {
    if (url && (url.startsWith('http') || url.startsWith('https'))) return url;
    const cleanUrl = url && url.startsWith('/') ? url.substring(1) : url;
    const baseUrl = cmsBaseUrl.endsWith('/') ? cmsBaseUrl : `${cmsBaseUrl}/`;
    return `${baseUrl}${cleanUrl}`;
  };

  const fullBgImageUrls = {
    bgImageOne: bgImageOne ? getFullImageUrl(bgImageOne.url) : null,
    bgImageTwo: bgImageTwo ? getFullImageUrl(bgImageTwo.url) : null,
    bgImageThree: bgImageThree ? getFullImageUrl(bgImageThree.url) : null
  };

  const fullImageUrls = {
    imageOne: imageOne ? getFullImageUrl(imageOne.url) : null,
    imageTwo: imageTwo ? getFullImageUrl(imageTwo.url) : null,
    imageThree: imageThree ? getFullImageUrl(imageThree.url) : null
  };

  return (
    <section className="hero_content_block_parent">
      {/* Layer 2 (Middle) */}
      <div
        className="h2_bg bg-no-repeat bg-[100%] aspect-[1070/920]"
        style={{ backgroundImage: `url(${fullBgImageUrls.bgImageTwo})` }}
      >
        {imageTwo && fullImageUrls.imageTwo && (
          <Image
            src={fullImageUrls.imageTwo}
            alt={imageTwo.alt || "Hero Image Two"}
            width={1600}
            height={900}
            className="w-[120%] h-auto object-cover mt-auto h-full"
            priority={true}
            unoptimized={true}
          />
        )}
        {data.p2Hyperlink && data.p2Hyperlink.url && (
          <a href={data.p2Hyperlink.url} className="absolute inset-0" />
        )}
      </div>

      {/* Layer 1 (Left) */}
      <div
        className="h1_bg bg-no-repeat aspect-[747/920]"
        style={{ backgroundImage: `url(${fullBgImageUrls.bgImageOne})` }}
      >
        {imageOne && fullImageUrls.imageOne && (
          <Image
            src={fullImageUrls.imageOne}
            alt={imageOne.alt || "Hero Image One"}
            width={1400}
            height={900}
            className="w-full h-auto object-cover mt-auto h-full"
            priority={true}
            unoptimized={true}
          />
        )}
        {data.p1Hyperlink && data.p1Hyperlink.url && (
          <a href={data.p1Hyperlink.url} className="absolute inset-0" />
        )}
      </div>

      {/* Layer 3 (Right) */}
      <div
        className="h3_bg bg-no-repeat aspect-[747/920]"
        style={{ backgroundImage: `url(${fullBgImageUrls.bgImageThree})` }}
      >
        {imageThree && fullImageUrls.imageThree && (
          <Image
            src={fullImageUrls.imageThree}
            alt={imageThree.alt || "Hero Image Three"}
            width={1400}
            height={900}
            className="w-full h-auto object-cover mt-auto h-full"
            priority={true}
            unoptimized={true}
          />
        )}
        {data.p3Hyperlink && data.p3Hyperlink.url && (
          <a href={data.p3Hyperlink.url} className="absolute inset-0" />
        )}
      </div>
    </section>
  );
}
