"use client";

import React, { useRef } from "react";
import Link from "next/link";
import { Swiper, SwiperSlide } from "swiper/react";
// If you still want any Swiper features (like loop), import modules as needed:
import { Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";

import SingleFixtureEle from "./SingleFixtureEle"; // Adjust import path as necessary

export default function FixturesGrid({ data }) {
  // We’ll store the Swiper instance here
  const swiperRef = useRef(null);

  if (!data || !data.fixturesEntries || data.fixturesEntries.length === 0) {
    return null;
  }

  const fixtures = data.fixturesEntries;

  // Functions to manually call slidePrev/slideNext on the Swiper
  const handlePrev = () => {
    if (swiperRef.current) {
      swiperRef.current.slidePrev();
    }
  };

  const handleNext = () => {
    if (swiperRef.current) {
      swiperRef.current.slideNext();
    }
  };

  return (
    <section className="base_paddings mt-[-3.8%] z-[8] relative fixturesGrid">
      <div className="mx-auto">
        <div className="relative">
          <Swiper
            modules={[Navigation]}
            spaceBetween="3.5%"
            slidesPerView={1}
            breakpoints={{
              640: { slidesPerView: 2,initialSlide:0 },
              1024: { slidesPerView: 3,initialSlide:1 },
            }}
            centeredSlides={true}
            initialSlide={0}
            loop={false}
            // Assign the swiper instance to our ref on init
            onBeforeInit={(swiper) => {
              swiperRef.current = swiper;
            }}
            className="fixtures-swiper"
          >
            {fixtures.map((fixture) => (
              <SwiperSlide key={fixture.id}>
                {({ isActive }) => (
                  <SingleFixtureEle
                    fixture={fixture}
                    isActive={isActive}
                    cmsBaseUrl={process.env.NEXT_PUBLIC_CMS_URL}
                  />
                )}
              </SwiperSlide>
            ))}
          </Swiper>

          {/* Manually controlled nav buttons */}
          <div className="flex justify-center mt-0 gap-[8vw]">
            <button
              onClick={handlePrev}
              className="w-10 h-10 flex items-center justify-center rounded-full border border-[var(--panel-line-strong)] text-[color:var(--text)] hover:border-[var(--orange)] hover:text-[color:var(--orange)] transition-colors"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              onClick={handleNext}
              className="w-10 h-10 flex items-center justify-center rounded-full border border-[var(--panel-line-strong)] text-[color:var(--text)] hover:border-[var(--orange)] hover:text-[color:var(--orange)] transition-colors"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>

        <div className="text-center mt-8">
          <Link href="/schedule">
            <button className="ccc-btn ccc-btn-primary px-6 py-2 rounded-full roboto-condensed-regular p2">
              View all
            </button>
          </Link>
        </div>
      </div>
    </section>
  );
}
