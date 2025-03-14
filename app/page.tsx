import { Button } from "@/components/ui/button";
import MainLayout from "@/components/layout/main-layout";
import Link from "next/link";

export default function Home() {
  return (
    <MainLayout>
      <div className="font-sans text-gray-900">
        <section className="relative h-screen bg-black mt-[-80]">
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
            <Button>
              <Link href={"/products"}>Shop Now</Link>
            </Button>
          </div>
        </section>
      </div>
    </MainLayout>
  );
}
