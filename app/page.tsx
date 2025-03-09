"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/layout/navbar";
import Loading from "@/components/ui/loading";
import { useAuth } from "@/context/authContext";
import Link from "next/link";

export default function Home() {
  const { token, username, role } = useAuth();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <Loading />;
  }

  return (
    <div className="font-sans text-gray-900">
      <Navbar username={username} role={role} />

      <section className="relative h-screen bg-black">
        <video
          className="object-cover w-full h-full absolute inset-0"
          autoPlay
          loop
          muted
        >
          <source src="/videos/herosection.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-black opacity-40"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center text-white">
          <h1 className="text-5xl font-bold mb-4">Welcome to PharmaKart</h1>
          <p className="text-xl mb-6">Your trusted online pharmacy</p>
          <Button>Shop Now</Button>
        </div>
      </section>

      <section id="how-we-work" className="py-16">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl font-semibold mb-6 text-teal-900">
            How We Work
          </h2>
          <p className="text-lg mb-8 text-teal-900">
            PharmaKart makes it easy to order medicines online, with secure
            payments, prescription uploads, and timely reminders for refills.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-lg">
              <h3 className="text-xl font-semibold mb-4 text-teal-900">
                Step 1: Browse & Order
              </h3>
              <p className="text-teal-900">
                Browse our vast collection of medicines and add them to your
                cart.
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-lg">
              <h3 className="text-xl font-semibold mb-4 text-teal-900">
                Step 2: Upload Prescription
              </h3>
              <p className="text-teal-900">
                Upload your prescription for medicines that require one.
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-lg">
              <h3 className="text-xl font-semibold mb-4 text-teal-900">
                Step 3: Fast Delivery
              </h3>
              <p className="text-teal-900">
                Get your medicines delivered right to your doorstep.
              </p>
            </div>
          </div>
        </div>
      </section>

      {token ? (
        <section
          id="welcome"
          className="py-16 bg-teal-400 text-white text-center"
        >
          <h2 className="text-3xl font-semibold mb-6">
            Welcome back, {username}!
          </h2>
          <p className="text-lg mb-8">
            Continue shopping and discover our latest offers.
          </p>
          <Button>Shop Now</Button>
        </section>
      ) : (
        <section id="join" className="py-16 bg-teal-400 text-white text-center">
          <h2 className="text-3xl font-semibold mb-6">Join Us Today</h2>
          <p className="text-lg mb-8">
            Sign up or log in to start ordering your medicines online.
          </p>
          <div className="flex justify-center gap-6">
            <Link href="/auth">
              <Button>Login / Signup</Button>
            </Link>
          </div>
        </section>
      )}

      <footer className="py-6 bg-teal-900 text-white text-center">
        <p>&copy; 2025 PharmaKart. All Rights Reserved.</p>
        <div className="mt-4">
          <a href="#" className="text-teal-200 hover:text-teal-400 mr-6">
            Privacy Policy
          </a>
          <a href="#" className="text-teal-200 hover:text-teal-400">
            Terms & Conditions
          </a>
        </div>
      </footer>
    </div>
  );
}
