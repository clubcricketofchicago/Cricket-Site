"use client";

import Image from "next/image";
import React from "react";

export default function SponsorsBanner({ data }) {
  // Adjust this to match your CMS base URL
  const cmsBaseUrl = process.env.NEXT_PUBLIC_CMS_URL || "https://cms-ccc.ddev.site/";

  // Helper to build a full absolute URL (if the sponsor image's url isn't already absolute)
  const getFullImageUrl = (url) => {
    if (!url) return "/images/placeholder.png";
    if (url.startsWith("http")) return url;
    const cleanUrl = url.startsWith("/") ? url.substring(1) : url;
    const baseUrl = cmsBaseUrl.endsWith("/") ? cmsBaseUrl : `${cmsBaseUrl}/`;
    return `${baseUrl}${cleanUrl}`;
  };

  // Pull out the three sponsor images (each array can have 1 or more images)
  const sponsorOne = data?.sImageOne?.[0] || null;
  const sponsorTwo = data?.sImageTwo?.[0] || null;
  const sponsorThree = data?.sImageThree?.[0] || null;

  // Pull out their corresponding hyperlinks
  const sponsorOneLink = data?.SOneHyperlink?.url || null;
  const sponsorTwoLink = data?.STwoHyperlink?.url || null;
  const sponsorThreeLink = data?.SThreeHyperlink?.url || null;

  // Build an array for easier mapping
  const sponsorItems = [
    { image: sponsorOne, link: sponsorOneLink },
    { image: sponsorTwo, link: sponsorTwoLink },
    { image: sponsorThree, link: sponsorThreeLink },
  ].filter((item) => item.image); // keep only sponsors that have an image

  return (
    <section className="sponsors-banner relative py-16 px-4">
      {/* Background image */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/images/sponsors_bg.png"
          alt="Sponsors background"
          fill
          className="object-cover"
          priority
        />
      </div>

      {/* Content container */}
      <div className="relative z-10 container mx-auto">
        {/* Title */}
        <h2 className="text-4xl md:text-5xl font-bold text-center mb-12 text-black oswald-bold">
          {data?.title || "Our Sponsors"}
        </h2>

        {/* Sponsors grid */}
        <div
          className={`
            grid 
            ${sponsorItems.length <= 1 
              ? "grid-cols-1" 
              : sponsorItems.length === 2
              ? "grid-cols-1 md:grid-cols-2"
              : "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
            } 
            gap-8 w-full mx-auto
          `}
        >
          {sponsorItems.map(({ image, link }, index) => {
            const imageUrl = getFullImageUrl(image.url);
            const altText = image.alt || image.title || "Sponsor logo";

            return (
              <div
                key={image.id || index}
                className="flex justify-center items-center p-4 rounded-lg"
              >
                {/* If we have a link, wrap the image in <a>. Otherwise, just render the image. */}
                {link ? (
                  <a href={link} target="_blank" rel="noopener noreferrer">
                    <Image
                      src={imageUrl}
                      alt={altText}
                      width={300}
                      height={200}
                      className="max-h-48 w-auto object-contain"
                      unoptimized={true}
                    />
                    <noscript>
                      <img
                        src={imageUrl}
                        alt={altText}
                        className="max-h-48 w-auto object-contain"
                      />
                    </noscript>
                  </a>
                ) : (
                  <>
                    <Image
                      src={imageUrl}
                      alt={altText}
                      width={300}
                      height={200}
                      className="max-h-48 w-auto object-contain"
                      unoptimized={true}
                    />
                    <noscript>
                      <img
                        src={imageUrl}
                        alt={altText}
                        className="max-h-48 w-auto object-contain"
                      />
                    </noscript>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
