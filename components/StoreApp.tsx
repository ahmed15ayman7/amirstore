"use client";
import type { StoreData, User } from "@/lib/types";
import { StoreProvider } from "./store";
import { CursorGlow, Loader } from "./fx";
import { About, Contact, Faq, Features, Footer, Hero, HowTo, Marquee, Nav, Partners, Services, Tournament, WaFloat } from "./sections";
import { Prices } from "./Prices";
import CartDrawer, { MobileCartBar, Toast } from "./CartDrawer";
import AuthModal from "./AuthModal";
import ChatBot from "./ChatBot";

export default function StoreApp({ data, initialUser }: { data: StoreData; initialUser: User | null }) {
  return (
    <StoreProvider data={data} initialUser={initialUser}>
      <Loader />
      <CursorGlow />
      <Nav />
      <Hero />
      <Marquee />
      <Features />
      <Services />
      <Prices />
      <HowTo />
      <Tournament />
      <Partners />
      <About />
      <Faq />
      <Contact />
      <Footer />
      <WaFloat />
      <CartDrawer />
      <MobileCartBar />
      <Toast />
      <AuthModal />
      <ChatBot />
    </StoreProvider>
  );
}
