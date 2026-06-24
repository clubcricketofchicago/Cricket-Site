"use client";

export const dynamic = 'force-dynamic';

import React, { FormEvent, useRef } from "react";
import { sendForm } from "emailjs-com";
import Image from "next/image"; // 1) Import Next.js <Image>
import { Reveal } from "../components/motion";
import { motion } from "framer-motion";

export default function BGWithForm() {
  const form = useRef<HTMLFormElement>(null);

  function clearInputFields() {
    if (!form.current) return;
    form.current.reset();
  }

  function sendEmail(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!form.current) return;

    sendForm(
      "service_13kiadg",        // your EmailJS service ID
      "template_hr5t6cq",       // your EmailJS template ID
      form.current,
      "It3y6Vk01CcKyFTFD"       // your EmailJS public key
    ).then(
      (result) => {
        if (result.text === "OK") {
          clearInputFields();
          const scBtn = document.getElementById("SC_BTN");
          if (scBtn) {
            scBtn.classList.remove("hidden_SC");
            setTimeout(() => {
              scBtn.classList.add("hidden_SC");
            }, 5000);
          }
        }
      },
      (error) => {
      }
    );
  }

  return (
    <section className="join_us_container">
      <div className="base_padding">
        <div className="join_us_parent max_content center_aligned">
          <Reveal className="join_us_form">
            <div className="jUF_title">
              <h2 className="oswald-regular h1 brand_orange">Join the Team</h2>
            </div>
            <div className="jUF_copy">
              <p className="roboto-condensed-regular p4">
                Join Club Cricket of Chicago team and be a part of an exciting
                journey to success. Compete with and against the best players in
                the city while developing your skills and building lifelong
                friendships. Join the team and
                <br />
                <span className="roboto-condensed-bold">
                  LET&apos;S DOMINATE THE PITCH!
                </span>
              </p>
            </div>
            <form ref={form} name="ju_form" onSubmit={sendEmail}>
              <div className="fullWidth_inpuTag">
                <div className="inputTag_holder">
                  <label className="roboto-condensed-regular p2">Full Name</label>
                  <br />
                  <input
                    type="text"
                    name="full_name"
                    className="roboto-condensed-light p4"
                    required
                  />
                </div>
              </div>
              <div className="fullWidth_inpuTag">
                <div className="inputTag_holder">
                  <label className="roboto-condensed-regular p2">Email</label>
                  <br />
                  <input
                    type="email"
                    name="email"
                    className="roboto-condensed-light p4"
                    required
                  />
                </div>
              </div>
              <div className="fullWidth_inpuTag">
                <div className="inputTag_holder">
                  <label className="roboto-condensed-regular p2">Phone Number</label>
                  <br />
                  <input
                    className="roboto-condensed-light p4"
                    type="tel"
                    name="telphone"
                    placeholder="888 888 8888"
                    pattern="[0-9]{3} [0-9]{3} [0-9]{4}"
                    maxLength={12}
                    title="Ten digits code"
                    required
                  />
                </div>
              </div>
              <div className="fifty_fifty_inputTag flex_grid">
                <div className="inputTag_holder">
                  <label className="roboto-condensed-regular p2">Age</label>
                  <br />
                  <input
                    type="number"
                    name="age"
                    className="roboto-condensed-light p4"
                    required
                  />
                </div>
                <div className="inputTag_holder">
                  <label className="roboto-condensed-regular p2">Gender</label>
                  <br />
                  <input
                    type="text"
                    name="gender"
                    className="roboto-condensed-light p4"
                    required
                  />
                </div>
              </div>
              <div className="fullWidth_inpuTag">
                <div className="inputTag_holder">
                  <label className="roboto-condensed-regular p2">
                    CricClub Player ID
                  </label>
                  <br />
                  <input
                    type="text"
                    name="club_id"
                    className="roboto-condensed-light p4"
                    required
                  />
                </div>
              </div>
              <div className="fullWidth_inpuTag">
                <div className="inputTag_holder">
                  <label className="roboto-condensed-regular p2">Short Bio</label>
                  <br />
                  <textarea name="bio" className="roboto-condensed-light p4"></textarea>
                </div>
              </div>
              <div className="form_submitButton">
                <motion.input
                  type="submit"
                  value="Submit"
                  className="roboto-condensed-med p1"
                  whileHover={{ scale: 1.05, y: -3 }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ type: "spring", stiffness: 400, damping: 17 }}
                />
              </div>
            </form>
          </Reveal>
        </div>
        <div className="success_msg">
          <div id="SC_BTN" className="SM_container flex_grid hidden_SC">
            <div className="SM_ico">
              {/* 2) Replace <img> with <Image> */}
              <Image
                src="/images/submit-successfully.svg"
                alt="Form Submitted Successfully"
                width={50}
                height={50}
                unoptimized
              />
            </div>
            <div className="SM_msg">
              <p className="roboto-condensed-regular p2">Form Submitted</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
